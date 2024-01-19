const express = require('express');
const app = express();
const path = require('path')
const morgan = require('morgan')

require('dotenv').config()

const Prompt = require('./models/prompt');
const openai = require('./myOpenAi');

app.use(morgan('common'));

app.use(express.json()) // body parser: json
app.use(express.urlencoded({ extended: true })); // body parser: formdata

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static('public'));

app.get('/', async (req, res) => {
    //send the links to test endpoints
    let data
    res.render('home', { data });
});

app.get('/test', async (req, res) => {
    try {
        const templateName = req.query.template;
        const promptText = req.query.prompt;

        const prompt = await Prompt.findOne({ prompt: promptText })

        if (prompt) {
            return res.render(`${templateName}-template`, {data:prompt})
        } else {
            res.redirect('/chat')
        }

        res.render(`${templateName}-template`, { response: 'Generated Response' });
    } catch (error) {
        console.log(error)
        res.redirect('/errorPage')
    }
});


app.get('/chat', async (req, res) => {
    let response
    let message
    let promptText
    try {
        promptText = req.query.prompt
        if (promptText) {
            // consult chatgpt API gangan
            response = await openai.chat.completions.create({
                messages: [{ role: "system", content: promptText }],
                model: "gpt-3.5-turbo",
            });


            return res.render('chat', { userPrompt: promptText, data: response.choices[0].message.content, message: message })
        }
        res.render('chat', { userPrompt: promptText, data: response, message: message })
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Too many requests. Please wait and try again later.');
            return res.render('chat', { message: `Rate Limit Exceeded, please try again Later` })
        } else {
            console.error('Error:', error.message);
            return res.render('chat', { userPrompt: promptText, data: response, message: 'An Error Occcured' })
        }
    }
})


app.get('/api/chat', async (req, res) => {

    try {
        let promptText = req.query.prompt
        if (!promptText) {
            return res.status(400).json({ message: 'prompt query parameter is missing'})
        }

        response = await openai.chat.completions.create({
            messages: [{ role: "system", content: promptText }],
            model: "gpt-3.5-turbo",
        });

        return res.status(200).json({ message: 'success', data: { prompt: promptText, response: response.choices[0].message.content } })
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error('Too many requests. Please wait and try again later.');
            return res.status(429).json({ message: `Rate Limit Exceeded, please try again Later` })
        } else {
            console.error('Error:', error.message);
            return res.status(500).json({ message: 'An Error Occured' })
        }
    }

})

app.get('/errorPage', async (req, res) => {
    res.render('errorPage')
})


module.exports = app
