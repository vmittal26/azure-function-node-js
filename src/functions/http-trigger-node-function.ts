import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { availableParallelism } from "node:os";
import { pbkdf2 } from "node:crypto";


const availableParallelismCount = availableParallelism();

export const  httpTrigger = async(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>=> {
    
    try{
        const start = Date.now();
        context.log(`Http function processed request for url "${request.url}"`);

        const promises = [];

        context.log(`Available parallelism ${availableParallelismCount}`);

        for(let i = 0; i< 25; i++){
            promises.push(doHash(start));
        }
       
        const value = await Promise.all(promises);

        context.log(value);

        const name = request.query.get('name') || await request.text() || 'world';

        context.log(`Function took ${Date.now() - start} `)
    
        return { body: `Hello, ${name}!` };
    }catch(error){
        context.error('Error while making request!');
    }
    
   
};

const doHash = (start: number)=>new Promise((resolve , _reject)=>{
        pbkdf2('a','b',100000,512,'sha512',()=>{
            resolve('Hash: '+(Date.now()-start));
        })
});

app.http('http-trigger-node-function', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
