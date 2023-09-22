import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { availableParallelism , cpus} from "node:os";
import { pbkdf2 } from "node:crypto";
import {readFileSync} from 'node:fs';


const availableParallelismCount = availableParallelism();

export const  httpTrigger = async(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>=> {
    
    try{
        const start = Date.now();
        context.log(`Started function for ${context.invocationId} at ${(new Date())}`);

        const promises = [];

        context.log(`Available parallelism ${availableParallelismCount}`);

        readFile(context);

        // for(let i = 0; i< availableParallelismCount; i++){
        //     promises.push(doHash());
        // }
       
        // const value = await Promise.all(promises);

        // context.log(value);

        const name = request.query.get('name') || await request.text() || 'world';

        context.log(`Function invocation id ${context.invocationId} took ${Date.now() - start} `)
    
        return { body: `Hello, ${name}!` };
    }catch(error){
        context.error('Error while making request!', error);
    }
    
   
};

const readFile = (context:InvocationContext)=>{
    for (let i = 1; i <= 2; i++) {

        context.log('read file');
        const memoryData = process.memoryUsage();
        const formatMemoryUsage = (data:any) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    
        const memoryUsage = {
          rss: `${formatMemoryUsage( memoryData.rss )} -> Resident Set Size - total memory allocated for the process execution`,
          heapTotal: `${formatMemoryUsage( memoryData.heapTotal )} -> total size of the allocated heap`,
          heapUsed: `${formatMemoryUsage( memoryData.heapUsed )} -> actual memory used during the execution`,
          external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
        };
        readFileSync('25MB.bin', 'utf-8');
      
        context.log(memoryUsage);
      }
}

const doHash = ()=>new Promise((resolve , _reject)=>{
       const start = Date.now();
        pbkdf2('a','b',100000,512,'sha512',()=>{
            resolve('Hash: '+(Date.now()-start));
        })
});

app.http('http-trigger-node-function', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
