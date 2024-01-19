const openai = require('./myOpenAi')
const Prompt = require('./models/prompt')

const connectToDb = require('./dbConnection')

const getResponse = async (prompt) => {
    try {
        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
        })
        console.log(`Response gotten for prompt: (${prompt})        >>>>>`)
        return { prompt, response: response.choices[0].message.content }
    } catch (error) {
        return new Error('An Error Occured')
    }

}


const promptList = ['about-cat', 'best-football-player', 'future-of-ai', 'german-shepherd']

const saveSamplePrompts = async (promptList) => {
    console.log(`Process Started           >>>>>`)
    let resArray = []
    try {
        await connectToDb()
        // clear the old prompts in the db
        await Prompt.deleteMany({});

        for (const prompt of promptList) {
            const res = await getResponse(prompt)
            resArray.push(res)
        }
        await Prompt.insertMany(resArray)
        console.log("Sample Prompts Created And Added into the Db Succesfully!!")
        process.exit()
    } catch (error) {
        console.error("Error processing prompts:", error);
        process.exit()
    }
};


saveSamplePrompts(promptList)
