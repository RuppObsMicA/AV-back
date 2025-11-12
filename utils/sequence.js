const mongoose = require('mongoose');

/**
 * Получить следующий ID для указанной последовательности
 * Использует встроенные возможности MongoDB для атомарного инкремента
 */
const getNextSequenceValue = async (sequenceName) => {
  const countersCollection = mongoose.connection.db.collection('counters');
  const sequenceDocument = await countersCollection.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return sequenceDocument.seq;
};

module.exports = { getNextSequenceValue };
