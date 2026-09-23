const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();

const PORT = process.env.PORT || 5001;

/*
 * Middleware
 */
app.use(cors());

app.use(
  express.json({
    limit: '50mb'
  })
);

/*
 * Database file
 */
const DATA_DIR = path.join(__dirname, 'data');

const DATA_FILE = path.join(
  DATA_DIR,
  'id_cards.json'
);

/*
 * Make sure data directory exists.
 */
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true
  });
}

/*
 * Make sure database file exists.
 */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify([], null, 2),
    'utf-8'
  );
}

/*
 * Read ID card data.
 */
const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(
        DATA_FILE,
        JSON.stringify([], null, 2),
        'utf-8'
      );

      return [];
    }

    const fileData = fs.readFileSync(
      DATA_FILE,
      'utf-8'
    );

    /*
     * Empty file = empty database.
     */
    if (!fileData.trim()) {
      return [];
    }

    const parsedData = JSON.parse(
      fileData
    );

    /*
     * Make sure the database is an array.
     */
    if (!Array.isArray(parsedData)) {
      console.error(
        'id_cards.json does not contain an array.'
      );

      return [];
    }

    return parsedData;
  } catch (error) {
    console.error(
      'Error reading ID card database:',
      error
    );

    return [];
  }
};

/*
 * Write ID card data.
 */
const writeData = (data) => {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(
        data,
        null,
        2
      ),
      'utf-8'
    );

    return true;
  } catch (error) {
    console.error(
      'Error writing ID card database:',
      error
    );

    throw error;
  }
};

/*
 * Health check
 */
app.get(
  '/api/health',
  (req, res) => {
    res.json({
      status: 'ok',
      message: 'Backend server is running.',
      dataFile: DATA_FILE
    });
  }
);

/*
 * Admin Login
 */
app.post(
  '/api/admin/login',
  (req, res) => {
    try {
      const { username, password } = req.body || {};
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

      if (username === adminUser && password === adminPass) {
        return res.status(200).json({
          success: true,
          message: 'Admin authenticated successfully!',
          token: 'admin-auth-session-' + Date.now()
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid Admin username or password!'
      });
    } catch (error) {
      console.error(
        'POST /api/admin/login error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message
      });
    }
  }
);

/*
 * Get all ID cards
 */
app.get(
  '/api/cards',
  (req, res) => {
    try {
      const cards = readData().map((card) => ({
        ...card,
        status: card.status || 'ACTIVE'
      }));

      res.status(200).json(cards);
    } catch (error) {
      console.error(
        'GET /api/cards error:',
        error
      );

      res.status(500).json({
        message:
          'Error retrieving ID cards',
        error:
          error.message
      });
    }
  }
);

/*
 * Get one ID card by ID
 */
app.get(
  '/api/cards/:id',
  (req, res) => {
    try {
      const cards = readData();

      const card = cards.find(
        (item) =>
          item.id === req.params.id
      );

      if (!card) {
        return res.status(404).json({
          message:
            'ID Card not found'
        });
      }

      res.status(200).json({
        ...card,
        status: card.status || 'ACTIVE'
      });
    } catch (error) {
      console.error(
        'GET /api/cards/:id error:',
        error
      );

      res.status(500).json({
        message:
          'Error retrieving ID card',
        error:
          error.message
      });
    }
  }
);

/*
 * Create a new ID card
 */
app.post(
  '/api/cards',
  (req, res) => {
    try {
      const cards = readData();

      const newCard = {
        ...req.body,

        id:
          req.body.id ||
          uuidv4(),

        status:
          req.body.status ||
          'ACTIVE',

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString()
      };

      cards.push(newCard);

      writeData(cards);

      res.status(201).json({
        message:
          'ID Card saved successfully!',

        card: newCard
      });
    } catch (error) {
      console.error(
        'POST /api/cards error:',
        error
      );

      res.status(500).json({
        message:
          'Error saving ID card data',

        error:
          error.message
      });
    }
  }
);

/*
 * Create or update an ID card
 */
app.put(
  '/api/cards/:id',
  (req, res) => {
    try {
      const cards = readData();

      const index =
        cards.findIndex(
          (card) =>
            card.id ===
            req.params.id
        );

      const now =
        new Date().toISOString();

      /*
       * Card does not exist.
       * Create it.
       */
      if (index === -1) {
        const newCard = {
          ...req.body,

          id: req.params.id,

          status:
            req.body.status ||
            'ACTIVE',

          createdAt: now,

          updatedAt: now
        };

        cards.push(newCard);

        writeData(cards);

        return res.status(201).json({
          message:
            'ID Card created successfully!',

          card: newCard
        });
      }

      /*
       * Card exists.
       * Update it.
       */
      const updatedCard = {
        ...cards[index],

        ...req.body,

        id: req.params.id,

        status:
          req.body.status ||
          cards[index].status ||
          'ACTIVE',

        updatedAt: now
      };

      cards[index] =
        updatedCard;

      writeData(cards);

      res.status(200).json({
        message:
          'ID Card updated successfully!',

        card: updatedCard
      });
    } catch (error) {
      console.error(
        'PUT /api/cards/:id error:',
        error
      );

      res.status(500).json({
        message:
          'Error updating ID card',

        error:
          error.message
      });
    }
  }
);

/*
 * Delete an ID card
 */
app.delete(
  '/api/cards/:id',
  (req, res) => {
    try {
      const cards = readData();

      const updatedCards =
        cards.filter(
          (card) =>
            card.id !==
            req.params.id
        );

      /*
       * Card wasn't found.
       */
      if (
        cards.length ===
        updatedCards.length
      ) {
        return res.status(404).json({
          message:
            'ID Card not found'
        });
      }

      writeData(
        updatedCards
      );

      res.status(200).json({
        message:
          'ID Card deleted successfully!'
      });
    } catch (error) {
      console.error(
        'DELETE /api/cards/:id error:',
        error
      );

      res.status(500).json({
        message:
          'Error deleting ID card',

        error:
          error.message
      });
    }
  }
);

/*
 * Start server
 */
app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Backend Server running at http://localhost:${PORT}`
    );

    console.log(
      `📁 Data file: ${DATA_FILE}`
    );
  }
);