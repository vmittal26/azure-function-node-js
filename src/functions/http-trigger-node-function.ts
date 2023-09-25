import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { availableParallelism , cpus} from "node:os";
import { pbkdf2 } from "node:crypto";
import {readFileSync ,unlinkSync} from 'node:fs';
import {FilesManager} from 'turbodepot-node';


const availableParallelismCount = availableParallelism();

export const  httpTrigger = async(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>=> {
    
    try{
        const start = Date.now();
        context.log(`Started function for ${context.invocationId} at ${(new Date())}`);

        const promises = [];

        context.log(`Available parallelism ${availableParallelismCount}`);

        const filesManager = new FilesManager();

        readFile(context, filesManager);

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

const readFile = (context:InvocationContext , filesManager)=>{
    try{
        const outputPath = `${__dirname} + '/result-${context.invocationId}.txt`;
        let inputPathList = [];

         for(let i = 0;i < 10000;i++){
            inputPathList.push( __dirname + '/sample_file.txt');
         }

         filesManager.mergeFiles(inputPathList,outputPath);

         inputPathList = [];

         for(let i = 0;i < 15000;i++){
            inputPathList.push( __dirname + '/sample_file.txt');
         }

         filesManager.mergeFiles(inputPathList,outputPath);
         

        for(let i=0; i< 10 ;i++){
            const memoryData = process.memoryUsage();
            const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
        
            const memoryUsage = {
            rss: `${formatMemoryUsage( memoryData.rss )} -> Resident Set Size - total memory allocated for the process execution`,
            heapTotal: `${formatMemoryUsage( memoryData.heapTotal )} -> total size of the allocated heap`,
            heapUsed: `${formatMemoryUsage( memoryData.heapUsed )} -> actual memory used during the execution`,
            external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
            };
    
            readFileSync(outputPath, 'utf-8');

            unlinkSync(outputPath)
            
            context.log(memoryUsage);

        }
    }catch(error){
        console.error(error);
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
