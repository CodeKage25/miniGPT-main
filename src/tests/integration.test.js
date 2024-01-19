const request = require('supertest')
const nock = require('nock')

const app = require('../app')


describe("Client Should get response to a prompt", () => {
    it("Should Return chatGPT response from a prompt", async () => {
        const prompt = 'what is nodeJs'

        let nock_response = {
            "id": "chatcmpl-abc123",
            "object": "chat.completion",
            "created": 1677858242,
            "model": "gpt-3.5-turbo-1106",
            "usage": {
                "prompt_tokens": 13,
                "completion_tokens": 7,
                "total_tokens": 20
            },
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "This is the result of the test/n/ NodeJs is a javascript runtime bla bla!"
                    },
                    "logprobs": null,
                    "finish_reason": "stop",
                    "index": 0
                }
            ]
        }
        // Mock the chatGPT server
        nock('https://api.openai.com')
            .post(`/v1/chat/completions`, {
                messages: [{ role: "system", content: prompt }],
                model: "gpt-3.5-turbo",
            })
            .reply(200, nock_response);


        const rawResponse = await request(app)
            .get(`/api/chat?prompt=${prompt}`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .timeout(5000)


        const response = JSON.parse(rawResponse.res.text)

        expect(response.message).toBe('success')
        expect(response.data).toBeDefined()
        expect(response.data.prompt).toBe(prompt)
        expect(response.data.response).toBeDefined()
    })



})

