/*
previousMessages
      ↓
does ANY stored message
have the same id
as the new message?
      ↓
 true / false

*/

/*
UIMessage[]
    ↓
convertToModelMessages()
    ↓
ModelMessage[]

*/

// consumeStream()= "keep the AI generation alive on the server"

/*

return createUIMessageStreamResponse(...)

means:
This entire API route responds with the stream.

So instead of:
return Response.json(...)

you’re returning a live streaming response.
That is why the browser can start receiving tokens before the model is completely finished.

*/