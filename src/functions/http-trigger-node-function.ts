import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { availableParallelism } from "node:os";

export const  httpTrigger = async(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit>=> {
    context.log(`Http function processed request for url "${request.url}"`);

    console.log(`availableParallelism :${availableParallelism}`);

    const name = request.query.get('name') || await request.text() || 'world';

    return { body: `Hello, ${name}! with parallelism as ${availableParallelism}` };
};

app.http('http-trigger-node-function', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: httpTrigger
});
