import express from 'express';
import cors from 'cors';
import path from 'path';

interface Timestamp {
  unix: number;
  utc: string;
}

interface TimestampError {
  error: string;
}

const INVALID_DATE = 'Invalid Date';

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
    const unixDate = parseInt(dateString);
    const date = new Date(isNaN(unixDate) ? dateString : unixDate);

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
  const isError = 'error' in responseObj;

  if (isError) {
    res.statusCode = 400;
  }

  res.json(responseObj);
});

app.listen(process.env.PORT || 3000);
