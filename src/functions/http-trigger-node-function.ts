import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { availableParallelism } from "node:os";
import { pbkdf2 } from "node:crypto";

const start = Date.now();

export const  httpTrigger = async(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>=> {
    context.log(`Http function processed request for url "${request.url}"`);

    context.log(`Available parallelism ${availableParallelism}`)

    doHash(context)
    doHash(context);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}!` };
};

const doHash = (context:InvocationContext)=>{
    pbkdf2('a','b',100000,512,'sha512',()=>{
        context.log('Hash:', Date.now()-start);
    })
}

app.http('http-trigger-node-function', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
