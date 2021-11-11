// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory, CardFactory } = require('botbuilder');
const Cart = require("./model/cart");




class EchoBot extends ActivityHandler {
    constructor(conversationState, dialog) {
        super();

        if(!conversationState) throw new Error("Con required");

        this.conversationState = conversationState;
        this.dialog = dialog;
        this.accessor = this.conversationState.createProperty('DialogAccessor');
        // See https://aka.ms/abou0t-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            
            await this.dialog.run(context, this.accessor);
            await next();
        });

        

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity({
                        attachments: [CardFactory.adaptiveCard({
                            "type": "AdaptiveCard",
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "version": "1.0",
                            "body": [
                                {
                                    "type": "Image",
                                    "url": "https://e7.pngegg.com/pngimages/294/426/png-clipart-chatbot-internet-bot-artificial-intelligence-e-commerce-robot-electronics-text.png"
                                },
                                {
                                    "type": "TextBlock",
                                    "wrap": true,
                                    "text": "Hi there!\nI am a Ecommerece Bot please select what you want to do.\n"
                                }
                            ]
                        })]
                    });
                    await context.sendActivity({
                        attachments: [
                            CardFactory.heroCard(
                                'These are the suggestions',
                                null,
                                CardFactory.actions([
                                    {
                                        type: 'imBack',
                                        title: 'Product Catalog',
                                        value: 'Product Catalog'
                                    },
                                    {
                                        type: 'imBack',
                                        title: 'Cart',
                                        value:'Cart'
                                    },
                                    {
                                        type: 'imBack',
                                        title: 'FAQs',
                                        value:'FAQs'
                                    }
                                ])
                            )
                        ]
                    })
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
        this.onDialog(async(context,next) => {
            await this.conversationState.saveChanges(context, false);
            await next();
        });
        
    }
    
}

module.exports.EchoBot = EchoBot;
