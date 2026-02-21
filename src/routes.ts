import { Application } from "express";
import { healthRoutes } from "@gateway/routes/health";

export const appRoute = (app:Application)=>{
    app.use('',healthRoutes.routes())
}

