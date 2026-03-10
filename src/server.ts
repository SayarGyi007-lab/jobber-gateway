import {Logger} from 'winston'
import {CustomError, IErrorResponse, winstonLogger} from '@sayargyi007-lab/jobber-shared'
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express'
import cookieSession from 'cookie-session'
import hpp from 'hpp'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { StatusCodes } from 'http-status-codes'
import http from 'http'
import { config } from '@gateway/config'
import { appRoute } from '@gateway/routes'
import { elasticsearch } from '@gateway/elastic-search'
import { axiosAuthInstance } from '@gateway/services/api/auth.service'

const SERVER_PORT = 4000    
const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayServer', 'debug')

export class GatewayServer{
    private app:Application;

    constructor(app:Application){
        this.app = app
    }

    public start():void{
        this.securityMiddleware(this.app)
        this.standardMiddleware(this.app)
        this.routesMiddleware(this.app)
        this.startElasticSearch()
        this.errorHandler(this.app)
        this.startServer(this.app)
    }

    private securityMiddleware(app:Application):void{
        app.set('trust proxy',1)
        app.use(
            cookieSession({
                name: 'session',
                keys: [`${config.SECRET_KEY_ONE}`, `${config.SECRET_KEY_TWO}`],
                maxAge: 7 * 24 * 60 * 60 * 1000,
                secure: config.NODE_ENV !== 'development' //local
            })
        )

        app.use(hpp())
        app.use(helmet())
        app.use(cors({
            origin: config.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }))

        app.use((req:Request, _res:Response, next:NextFunction)=>{
            if(req.session?.jwt){
                axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`
            }
            next()
        })
    }



    private standardMiddleware(app:Application):void{
        app.use(compression())
        app.use(json({limit: '200mb'}))
        app.use(urlencoded({extended: true, limit: '200mb'}))
    }

    private routesMiddleware(app:Application):void{
        appRoute(app)
    }

    private startElasticSearch():void{
        elasticsearch.checkConnection()
    }

    private errorHandler(app:Application):void{
        app.use('*',(req:Request, res:Response, next:NextFunction)=>{
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
            log.log('error', `${fullUrl} endpoint does not exist`,'')
            res.status(StatusCodes.NOT_FOUND).json({message: 'This endpoint does not exist'})
            next()
        })

        app.use((error: IErrorResponse, _req:Request, res:Response, next:NextFunction)=>{
            log.log('error',`Gateway service ${error.comingFrom}: `,error)
            if(error instanceof CustomError){
                res.status(error.statusCode).json(error.serializeError())
            }
            next()
        })
    }

    private async startServer(app:Application):Promise<void>{
        try {
            const httpServer: http.Server = new http.Server(app)
            this.startHttpServer(httpServer)
        } catch (error) {
            log.log('error', 'startServer error', error)
        }
    }

    private async startHttpServer(httpServer: http.Server):Promise<void>{
        try {
            log.info(`Gateway server has started with process id ${process.pid}`)
            httpServer.listen(SERVER_PORT,()=>{
                log.info(`Gateway server is running on port: ${SERVER_PORT}`)
            })
        } catch (error) {
            log.log('error', 'GatewayService startServer() error method: ', error)
        }
    }
}