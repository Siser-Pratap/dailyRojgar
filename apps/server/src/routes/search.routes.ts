import { Router } from 'express'
import { SearchController } from '../controllers/search.controller'
import { validate } from '../middleware/validate.middleware'
import { searchServicesQuerySchema, searchWorkersQuerySchema } from '../validators/search.validator'

const router = Router()

router.get('/workers', validate(searchWorkersQuerySchema, 'query'), SearchController.searchWorkers)
router.get(
  '/services',
  validate(searchServicesQuerySchema, 'query'),
  SearchController.searchServices,
)

export default router
