import { SignUp } from "@gateway/controllers/auth/signup";
import express,{ Router } from "express"

class AuthRoute{
    private router: Router;
    
    constructor(){
        this.router = express.Router()
    }

    public routes(): Router{
        this.router.post('/auth/signup',SignUp.prototype.create)
        return this.router
    }
}

export const authRoute: AuthRoute = new AuthRoute()