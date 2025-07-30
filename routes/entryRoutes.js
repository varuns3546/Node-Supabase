import express from 'express';
import entryController from '../controllers/entryController.js';
const {authenticateUser, getEntries, getEntry, createEntry, deleteEntry, updateEntry} = entryController
const router = express.Router();

router.use(authenticateUser)

router.get('/', getEntries)
router.get('/:id', getEntry)
router.post('/', createEntry)
router.delete('/:id', deleteEntry)
router.put('/:id', updateEntry)

export default router;
