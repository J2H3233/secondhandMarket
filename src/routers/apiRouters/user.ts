import { Router } from 'express';

const router : Router = Router();

router.post('/signup', (req, res) => {
    // Handle signup logic here
    res.send('User signed up');
});

export default router;
