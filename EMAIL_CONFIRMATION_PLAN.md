# 📧 План реализации регистрации с подтверждением email

## 🎯 Цель
Изменить процесс регистрации: вместо отправки email+password сразу, пользователь сначала вводит только email, получает письмо с подтверждением, и только после клика по ссылке устанавливает пароль.

---

## 📊 Архитектура

### Общий флоу (упрощённый - 2 шага):
```
1. POST /auth/register { email }
   → Создаётся User со status='pending', password=null
   → Генерируется confirmationHash
   → Отправляется email со ссылкой вида:
      https://yourapp.com/set-password?hash=XXX

2. POST /auth/confirm { hash, password }
   → Проверяется валидность hash (существует? не истёк?)
   → Устанавливается пароль (bcrypt hash)
   → Статус меняется на 'active'
   → User создан и активирован

3. POST /auth/login { email, password }
   → Обычный логин (как раньше)
   → Возвращаются токены
```

**Отличие от 3-шагового:**
- ❌ Нет промежуточного GET /auth/verify
- ✅ Фронтенд сразу показывает форму установки пароля
- ✅ Проще для пользователя - меньше шагов

---

## 📝 Шаги реализации

### ✅ Шаг 1: Обновить модель User

**Файл:** `src/users/users.model.ts`

**Что добавить:**

```typescript
// Изменить password - теперь может быть NULL
@Column({type: DataType.STRING, allowNull: true})
password: string | null;

// Новые поля для подтверждения email
@Column({type: DataType.STRING, allowNull: true, unique: true})
confirmationHash: string | null;

@Column({type: DataType.DATE, allowNull: true})
confirmationExpires: Date | null;

// Статус пользователя
@Column({type: DataType.ENUM('pending', 'active', 'banned'), defaultValue: 'pending'})
status: 'pending' | 'active' | 'banned';
```

**Также обновить:**
```typescript
interface UserCreationAttrs {
    email: string;
    password?: string; // ← теперь опциональный
}
```

---

### ✅ Шаг 2: Создать новые DTO

#### 2.1 RegistrationRequestDto (только email)

**Файл:** `src/auth/dto/registration-request.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class RegistrationRequestDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Invalid email format' })
    readonly email: string;
}
```

---

#### 2.2 ConfirmationRequestDto (hash + password)

**Файл:** `src/auth/dto/confirmation-request.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ConfirmationRequestDto {
    @ApiProperty({ example: 'abc123xyz...', description: 'Confirmation hash from email link' })
    @IsString({ message: 'Hash must be a string' })
    readonly hash: string;

    @ApiProperty({ example: 'MySecurePassword123', description: 'User password' })
    @IsString({ message: 'Password must be a string' })
    @Length(6, 16, { message: 'Password must be between 6 and 16 characters' })
    readonly password: string;
}
```

---

#### 2.3 Обновить RegistrationResponseDto

**Файл:** `src/auth/dto/registration-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
    @ApiProperty({ example: 'Confirmation email sent. Please check your inbox.', description: 'Success message' })
    message: string;

    @ApiProperty({ example: 'user@example.com', description: 'Registered email' })
    email: string;
}
```

---

### ✅ Шаг 3: Создать модуль для отправки email

#### 3.1 Установить зависимость

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

#### 3.2 Создать MailModule

**Файл:** `src/mail/mail.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
```

---

#### 3.3 Создать MailService

**Файл:** `src/mail/mail.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter;

    constructor() {
        // Настройка транспорта (для разработки - Ethereal Email)
        // В продакшене замените на реальный SMTP (Gmail, SendGrid, etc.)
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendConfirmationEmail(email: string, confirmationHash: string) {
        const confirmationUrl = `${process.env.FRONTEND_URL}/confirm?hash=${confirmationHash}`;

        const mailOptions = {
            from: process.env.MAIL_FROM || 'noreply@yourapp.com',
            to: email,
            subject: 'Confirm your email address',
            html: `
                <h1>Welcome to Our App!</h1>
                <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
                <a href="${confirmationUrl}" style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                ">Confirm Email & Set Password</a>
                <p>Or copy this link to your browser:</p>
                <p>${confirmationUrl}</p>
                <p><strong>This link expires in 24 hours.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        return info;
    }
}
```

---

### ✅ Шаг 4: Обновить AuthService

**Файл:** `src/auth/auth.service.ts`

**Добавить импорты:**
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { ConfirmationRequestDto } from './dto/confirmation-request.dto';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';
```

**Обновить конструктор:**
```typescript
constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService, // ← добавить
) {}
```

**Добавить новые методы:**

```typescript
// 1. Начало регистрации (отправка email)
async startRegistration(dto: RegistrationRequestDto): Promise<RegistrationResponseDto> {
    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = await this.userService.getUserByEmail(dto.email);

    if (existingUser) {
        // Если есть активный пользователь - ошибка
        if (existingUser.status === 'active') {
            throw new HttpException('Email already registered', HttpStatus.BAD_REQUEST);
        }

        // Если есть pending - обновляем hash и отправляем новое письмо
        const confirmationHash = randomBytes(32).toString('hex');
        const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

        existingUser.confirmationHash = confirmationHash;
        existingUser.confirmationExpires = confirmationExpires;
        await existingUser.save();

        await this.mailService.sendConfirmationEmail(dto.email, confirmationHash);

        return {
            message: 'Confirmation email sent. Please check your inbox.',
            email: dto.email,
        };
    }

    // Создаём нового pending пользователя
    const confirmationHash = randomBytes(32).toString('hex');
    const confirmationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userService.createPendingUser({
        email: dto.email,
        confirmationHash,
        confirmationExpires,
    });

    await this.mailService.sendConfirmationEmail(dto.email, confirmationHash);

    return {
        message: 'Confirmation email sent. Please check your inbox.',
        email: dto.email,
    };
}

// 2. Подтверждение регистрации (установка пароля)
async confirmRegistration(dto: ConfirmationRequestDto) {
    const user = await this.userService.getUserByConfirmationHash(dto.hash);

    if (!user) {
        throw new HttpException('Invalid confirmation link', HttpStatus.BAD_REQUEST);
    }

    // Проверяем срок действия
    if (user.confirmationExpires && user.confirmationExpires < new Date()) {
        throw new HttpException('Confirmation link expired', HttpStatus.BAD_REQUEST);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(dto.password, 5);

    // Обновляем пользователя
    user.password = hashedPassword;
    user.status = 'active';
    user.confirmationHash = null;
    user.confirmationExpires = null;
    await user.save();

    // НЕ генерируем токены! Пользователь должен залогиниться сам
    return {
        message: 'Password set successfully. You can now login.',
        email: user.email,
    };
}
```

---

### ✅ Шаг 5: Добавить методы в UsersService

**Файл:** `src/users/users.service.ts`

```typescript
// Создание pending пользователя
async createPendingUser(data: {
    email: string;
    confirmationHash: string;
    confirmationExpires: Date;
}) {
    const user = await this.userRepository.create({
        email: data.email,
        password: null, // ← пароля ещё нет
        confirmationHash: data.confirmationHash,
        confirmationExpires: data.confirmationExpires,
        status: 'pending',
    });

    // Назначаем роль по умолчанию (не ADMIN, а normal!)
    const role = await this.roleService.getRoleByValue('normal');

    if (role) {
        await user.$set('roles', [role.id]);
        user.roles = [role];
    }

    return user;
}

// Получить пользователя по confirmation hash
async getUserByConfirmationHash(hash: string) {
    const user = await this.userRepository.findOne({
        where: { confirmationHash: hash },
        include: { all: true },
    });
    return user;
}
```

---

### ✅ Шаг 6: Обновить AuthController

**Файл:** `src/auth/auth.controller.ts`

**Заменить старый endpoint registration на новые:**

```typescript
import { RegistrationRequestDto } from './dto/registration-request.dto';
import { ConfirmationRequestDto } from './dto/confirmation-request.dto';

// Удалить старый POST /registration

// Добавить новые endpoints:

@ApiOperation({ summary: 'Start registration', description: 'Send confirmation email to user' })
@ApiResponse({ status: 201, description: 'Confirmation email sent', type: RegistrationResponseDto })
@ApiResponse({ status: 400, description: 'Email already registered', type: ErrorResponseDto })
@Post('/register')
register(@Body() dto: RegistrationRequestDto) {
    return this.authService.startRegistration(dto);
}

@ApiOperation({ summary: 'Confirm registration', description: 'Set password and activate account' })
@ApiResponse({ status: 200, description: 'Password set successfully', type: RegistrationResponseDto })
@ApiResponse({ status: 400, description: 'Invalid or expired link OR validation failed', type: ErrorResponseDto })
@Post('/confirm')
confirm(@Body() dto: ConfirmationRequestDto) {
    return this.authService.confirmRegistration(dto);
}
```

---

### ✅ Шаг 7: Обновить AuthModule

**Файл:** `src/auth/auth.module.ts`

**Добавить импорт:**
```typescript
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [
        // ... существующие импорты
        MailModule, // ← добавить
    ],
    // ...
})
```

---

### ✅ Шаг 8: Обновить переменные окружения

**Файл:** `.development.env` и `.production.env`

```env
# Существующие переменные...

# Mail settings
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your-ethereal-user@ethereal.email
MAIL_PASSWORD=your-ethereal-password
MAIL_FROM=noreply@yourapp.com

# Frontend URL (для ссылок в письмах)
FRONTEND_URL=http://localhost:3000
```

**Для разработки используйте Ethereal Email:**
1. Зайдите на https://ethereal.email/
2. Создайте тестовый аккаунт
3. Скопируйте credentials в `.development.env`

---

### ✅ Шаг 9: Обновить валидацию login

**Файл:** `src/auth/auth.service.ts`

**Метод validateUser нужно обновить:**

```typescript
private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);

    if (!user) {
        throw new UnauthorizedException({ message: 'Invalid email or password' });
    }

    // ← НОВАЯ ПРОВЕРКА: пользователь должен быть активным
    if (user.status !== 'active') {
        throw new UnauthorizedException({ message: 'Please confirm your email first' });
    }

    // ← НОВАЯ ПРОВЕРКА: пароль должен быть установлен
    if (!user.password) {
        throw new UnauthorizedException({ message: 'Please set your password first' });
    }

    const passwordEquals = await bcrypt.compare(userDto.password, user.password);

    if (passwordEquals) {
        return user.dataValues;
    }

    throw new UnauthorizedException({ message: 'Invalid email or password' });
}
```

---

### ✅ Шаг 10: (Опционально) Добавить cron для очистки

**Установить зависимость:**
```bash
npm install @nestjs/schedule
```

**Создать файл:** `src/users/users.cron.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { Op } from 'sequelize';

@Injectable()
export class UsersCron {
    constructor(@InjectModel(User) private userRepository: typeof User) {}

    // Запускается каждый день в 2:00 AM
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanupUnconfirmedUsers() {
        const result = await this.userRepository.destroy({
            where: {
                status: 'pending',
                createdAt: {
                    [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // старше 24 часов
                },
            },
        });

        console.log(`Cleaned up ${result} unconfirmed users`);
    }
}
```

**Обновить UsersModule:**
```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { UsersCron } from './users.cron';

@Module({
    imports: [
        // ...
        ScheduleModule.forRoot(), // ← добавить
    ],
    providers: [UsersService, UsersCron], // ← добавить UsersCron
})
```

---

## 🧪 Тестирование

### Шаг 1: Запустить приложение
```bash
npm run start:dev
```

### Шаг 2: Протестировать регистрацию

**1. Отправить email:**
```bash
POST http://localhost:5000/auth/registration
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Ожидаемый ответ:**
```json
{
  "message": "Confirmation email sent. Please check your inbox.",
  "email": "test@example.com"
}
```

**2. Проверить консоль** - там будет ссылка на письмо в Ethereal

**3. Скопировать hash из ссылки и проверить:**
```bash
GET http://localhost:5000/auth/verify?hash=abc123xyz...
```

**4. Установить пароль:**
```bash
POST http://localhost:5000/auth/confirm
Content-Type: application/json

{
  "hash": "abc123xyz...",
  "password": "MyPassword123"
}
```

**Ожидаемый ответ:** LoginResponseDto с токенами

---

## 📋 Чеклист выполнения

- [ ] Обновлена модель User (password NULL, confirmationHash, confirmationExpires, status)
- [ ] Созданы новые DTO (RegistrationRequestDto, ConfirmationRequestDto, VerifyResponseDto)
- [ ] Создан MailModule и MailService
- [ ] Добавлены методы в AuthService (startRegistration, verifyConfirmationHash, confirmRegistration)
- [ ] Добавлены методы в UsersService (createPendingUser, getUserByConfirmationHash)
- [ ] Обновлён AuthController (новые endpoints)
- [ ] Добавлен MailModule в AuthModule
- [ ] Обновлены переменные окружения
- [ ] Обновлена валидация в login (проверка статуса и пароля)
- [ ] (Опционально) Добавлен cron для очистки неподтверждённых пользователей
- [ ] Протестирован весь флоу регистрации

---

## 🚨 Важные замечания

1. **Не удаляйте старый endpoint сразу** - сначала протестируйте новый флоу
2. **Для production** замените Ethereal на реальный SMTP (Gmail, SendGrid, AWS SES)
3. **Добавьте rate limiting** на endpoint /registration (защита от спама)
4. **Логируйте** отправку писем для отладки
5. **Тестируйте** истечение ссылок (можно временно сделать expires = 1 минута)

---

## 🎓 Дополнительные фичи (после основной реализации)

- [ ] Endpoint для повторной отправки письма: `POST /auth/resend-confirmation`
- [ ] Кастомизация шаблонов писем (handlebars/pug)
- [ ] Уведомление о входе с нового устройства
- [ ] История входов (логирование IP, user-agent)
- [ ] Ограничение количества попыток отправки письма (rate limiting)

---

Удачи в реализации! 🚀
