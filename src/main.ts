import express from 'express';
import cors from 'cors';
import path from 'path';

const INVALID_DATE = 'Invalid Date';

interface Timestamp {
  unix: number;
  utc: string;
}

interface TimestampError {
  error: string;
}

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static(path.join(__dirname, 'public')));

const prepareDateResponse = (date: Date): Timestamp => ({
  unix: date.getTime(),
  utc: date.toUTCString(),
});

const getTimestampObject = (
  dateString: string | undefined,
): Timestamp | TimestampError => {
  if (!dateString) {
    const date = new Date();
    return prepareDateResponse(date);
  }

  try {
    const isUnixDate = /\d{5,}/.test(dateString);
    const datePrecursor = isUnixDate ? parseInt(dateString) : dateString;
    const date = new Date(datePrecursor);

    if (date.toString() === INVALID_DATE) {
      throw new Error(INVALID_DATE);
    }

    return prepareDateResponse(date);
  } catch (e) {
    return { error: e.message };
  }
};

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/api/timestamp/:date_string?', (req, res) => {
  const dateString = req.params.date_string;

  const responseObj = getTimestampObject(dateString);

  res.json(responseObj);
});

app.listen(process.env.PORT || 3000);
