const express = require('express');
const router = express.Router();
const Language = require('../models/Language');

/**
 * GET /api/v1/languages
 * Получить список всех языков
 */
router.get('/', async (req, res) => {
  try {
    const languages = await Language.find({}).sort({ id: 1 });

    res.json(languages.map((lang) => lang.toJSON()));
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/v1/languages/:id
 * Получить язык по ID
 */
router.get('/:id', async (req, res) => {
  try {
    const languageId = parseInt(req.params.id, 10);

    if (isNaN(languageId)) {
      return res.status(400).json({
        error: 'Invalid language ID',
        code: 'INVALID_ID',
      });
    }

    const language = await Language.findOne({ id: languageId });

    if (!language) {
      return res.status(404).json({
        error: 'Language not found',
        code: 'LANGUAGE_NOT_FOUND',
      });
    }

    res.json({
      data: language.toJSON(),
    });
  } catch (error) {
    console.error('Get language error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

module.exports = router;
