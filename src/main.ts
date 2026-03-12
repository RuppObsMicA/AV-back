import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { ValidationPipe } from "./common/pipes/validation.pipe";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function start() {
    const PORT = process.env.PORT || 5000;
    // NestExpressApplication gives us access to Express-specific methods like useStaticAssets
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Serve files from the ./uploads folder as static files at /uploads URL path.
    // Example: a file saved as ./uploads/1710000000.jpg will be accessible at:
    // http://localhost:5000/uploads/1710000000.jpg
    app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

    // Enable CORS for local development
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Set global API prefix
    app.setGlobalPrefix('api/v1');

    const config = new DocumentBuilder()
        .setTitle('NestJS course')
        .setDescription('REST API documentation')
        .setVersion('1.0.0')
        .addTag('Nest')
        // Adds "Authorize" button in Swagger UI so you can test JWT-protected routes
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    app.useGlobalPipes(new ValidationPipe());
    // app.useGlobalGuards(JwtAuthGuard);
    // Global guard

    await app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

start();