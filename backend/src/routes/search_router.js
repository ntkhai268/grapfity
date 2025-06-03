import express from 'express';
import { handleSearch } from '../controllers/searchController.js';

const searchRouter = express.Router();
searchRouter.get('/', handleSearch);

export default searchRouter;
