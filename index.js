const Alexa = require('ask-sdk-core');

const ACTIONS = ['rock', 'paper', 'scissor'];

const GameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GameIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Initialize session attributes if undefined
        sessionAttributes.userWins = sessionAttributes.userWins || 0;
        sessionAttributes.alexWins = sessionAttributes.alexWins || 0;
        sessionAttributes.ties = sessionAttributes.ties || 0;

        // Check if roundsLeft was set by RoundsIntent
        if (!sessionAttributes.roundsLeft) {
            sessionAttributes.roundsLeft = 3; // Default to 3 if not set
        }

        attributesManager.setSessionAttributes(sessionAttributes);

        // Retrieve slots
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const userAction = slots.action ? slots.action.value.toLowerCase() : null;
        const alexAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

        let speakOutput = '';
        let repromptOutput = 'What’s your next move?';

        // Validate user action
        if (!ACTIONS.includes(userAction)) {
            speakOutput = "Sorry, I didn’t understand your move. Please say rock, paper, or scissor.";
            return handlerInput.responseBuilder
                .speak(speakOutput + " " + repromptOutput)
                .reprompt(repromptOutput)
                .getResponse();
        }

        // Game logic
        const combo = userAction + alexAction;
        switch (combo) {
            case 'rockrock':
            case 'paperpaper':
            case 'scissorscissor':
                speakOutput += '<say-as interpret-as="interjection">Oh no!</say-as> It\'s a tie! We both played ' + userAction + '.';
                sessionAttributes.ties++;
                break;
            case 'rockscissor':
            case 'paperrock':
            case 'scissorpaper':
                speakOutput += '<say-as interpret-as="interjection">Hurray!</say-as> You won! You played ' + userAction + ', and I played ' + alexAction + '.';
                sessionAttributes.userWins++;
                break;
            case 'scissorrock':
            case 'rockpaper':
            case 'paperscissor':
                speakOutput += 'I win! You played ' + userAction + ', and I played ' + alexAction + '.';
                sessionAttributes.alexWins++;
                break;
        }

        // Decrease rounds
        sessionAttributes.roundsLeft--;
        attributesManager.setSessionAttributes(sessionAttributes);

        if (sessionAttributes.roundsLeft <= 0) {
            speakOutput += ' Game over! Final scores: You won ' + sessionAttributes.userWins + ' times, I won ' + sessionAttributes.alexWins + ' times, and there were ' + sessionAttributes.ties + ' ties. Would you like to play again?';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt('Would you like to start a new game?')
                .getResponse();
        }

        speakOutput += ' You have ' + sessionAttributes.roundsLeft + ' rounds left. ' + repromptOutput;

        return handlerInput.responseBuilder
            .speak('<voice name="Joanna">' + speakOutput + '</voice>')
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const ScoreIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ScoreIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Retrieve scores (default to 0 if undefined)
        const userWins = sessionAttributes.userWins || 0;
        const alexWins = sessionAttributes.alexWins || 0;
        const ties = sessionAttributes.ties || 0;

        const speakOutput = '<voice name="Matthew">Your current score is: You won ' + userWins + ' times, I won ' + alexWins + ' times, and there were ' + ties + ' ties. Keep playing to improve your score!</voice>';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What’s your next move?')
            .getResponse();
    }
};

// Custom Help Intent Handler
const CustomHelpIntentHandler = {
    canHandle(handlerInput) {
        console.log('Request Type:', Alexa.getRequestType(handlerInput.requestEnvelope));
        console.log('Intent Name:', Alexa.getIntentName(handlerInput.requestEnvelope));

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Rock, Paper, Scissors! Say "rock," "paper," or "scissors" to play the game. You can also ask for your current score by saying, "What’s my score?" When you’re ready to quit, just say "End the game." Let’s play!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('Would you like to play or check your score?')
            .getResponse();
    }
};

// Cancel and Stop Intent Handlers
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        console.log('Request Type:', Alexa.getRequestType(handlerInput.requestEnvelope));
        console.log('Intent Name:', Alexa.getIntentName(handlerInput.requestEnvelope));

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye! Thanks for playing Rock, Paper, Scissors.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const RoundsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RoundsIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Retrieve slots
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const rounds = slots.rounds ? parseInt(slots.rounds.value, 10) : null;

        let speakOutput = '';
        if (rounds && rounds > 0) {
            sessionAttributes.roundsLeft = rounds;
            attributesManager.setSessionAttributes(sessionAttributes);
            speakOutput = 'Great! We will play ' + rounds + ' rounds. What’s your first move? Say rock, paper, or scissor.';
        } else {
            sessionAttributes.roundsLeft = 3; // Default to 3 rounds
            attributesManager.setSessionAttributes(sessionAttributes);
            speakOutput = 'I’ll set the game to 3 rounds by default. What’s your first move? Say rock, paper, or scissor.';
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt('What’s your first move?')
            .getResponse();
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Initialize session attributes
        sessionAttributes.roundsLeft = undefined;
        sessionAttributes.name = undefined; // User's name will be captured next
        attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_intro_01"/> Welcome to Rock, Paper, Scissors! Before we start, what’s your name?';
        const repromptOutput = "Please tell me your name so we can get started.";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

const NameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NameIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        // Retrieve user's name from slots
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const name = slots.name ? slots.name.value : 'Player';

        // Store name in session attributes
        sessionAttributes.name = name;
        attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = 'Nice to meet you, ' + name + '! How many rounds would you like to play? You can say, for example, "I want to play 3 rounds."';
        const repromptOutput = "How many rounds would you like to play?";

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        GameIntentHandler,
        ScoreIntentHandler,
        CustomHelpIntentHandler,
        CancelAndStopIntentHandler,
        RoundsIntentHandler,
        NameIntentHandler
    )
    .lambda();
