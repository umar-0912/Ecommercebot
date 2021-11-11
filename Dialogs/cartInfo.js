const {ComponentDialog, WaterfallDialog, DialogSet, DialogTurnStatus, Dialog, ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt} = require("botbuilder-dialogs");
const { CardFactory } = require('botbuilder');
const Cart = require("../model/cart");
const cartInfoWF1 = 'cartInfoWF1';
const cartInfo = "cartInfo";
const User = require("../model/user");
var endDialog = '';

class CartInfo extends ComponentDialog {
    constructor(conversationState){
        super(cartInfo);
        if(!conversationState) throw new Error ("Con state require");
        this.conversationState = conversationState;
        
        this.addDialog(new WaterfallDialog(cartInfoWF1,[
            this.sendCart.bind(this),
            this.shown.bind(this),
            this.response.bind(this)
        ]));
        this.intialDialogId = cartInfoWF1;
    }

    
    async sendCart(step){
        endDialog = false;
        try{
            const prods = await Cart.find();
            
            for (let i = 0; i < prods.length; i++) {
                
                let prod = prods[i];
            
                    await step.context.sendActivity({
                        attachments: [CardFactory.adaptiveCard({
                            "type": "AdaptiveCard",
                            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                            "version": "1.3",
                            "body": [
                                {
                                    "type": "ColumnSet",
                                    "columns": [
                                        {
                                            "type": "Column",
                                            "width": "stretch",
                                            "items": [
                                                {
                                                    "type": "Image",
                                                    "url": prod.url,
                                                    "size": "Medium",
                                                    "horizontalAlignment": "Center"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "Column",
                                            "width": "stretch",
                                            "items": [
                                                {
                                                    "type": "TextBlock",
                                                    "wrap": true,
                                                    "color": "Accent",
                                                    "text": prod.name,
                                                    "fontType": "Default",
                                                    "size": "Large",
                                                    "horizontalAlignment": "Center"
                                                },
                                                {
                                                    "type": "TextBlock",
                                                    "wrap": true,
                                                    "color": "Accent",
                                                    "text": prod.price,
                                                    "fontType": "Default",
                                                    "size": "Large",
                                                    "horizontalAlignment": "Center"
                                                }]
                                        }]
                                }]
                        })]
                    });
                
                    
                
            }
            await step.context.sendActivity({
                attachments: [CardFactory.adaptiveCard({
                    "type": "AdaptiveCard",
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "version": "1.0",
                    "body": [
                        {
                            "type": "ActionSet",
                            "actions": [
                                {
                                    "type": "Action.Submit",
                                    "title": "Buy Now",
                                    "id": "buynow",
                                    "data": {
                                        "name":"Yes"
                                    }
                                }
                            ]
                        }, 
                        {
                            "type": "ActionSet",
                            "actions": [
                                {
                                    "type": "Action.Submit",
                                    "title": "Buy Later",
                                    "id": "buylater",
                                    "data": {
                                        "name":"No"
                                    }
                                }
                            ]    
                        }  
                    ]
                })]
            });
            return Dialog.EndOfTurn;
             
        }catch(error){
            console.log(error);
        }
        
    }

    async shown(step){
        if(step.context.activity.value){
            if(step.context.activity.value.name === "Yes"){
                await step.context.sendActivity({
                    attachments: [CardFactory.adaptiveCard({
                        "type": "AdaptiveCard",
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "version": "1.0",
                        "body": [
                            {
                                "type": "TextBlock",
                                "id": "userDetail",
                                "wrap": true,
                                "text": "Fill your Details",
                                "horizontalAlignment": "Center",
                                "color": "Accent",
                                "size": "Medium",
                                "fontType": "Default",
                                "style": "heading",
                                "weight": "Bolder",
                                "spacing": "Small"
                            },
                            {
                                "type": "Input.Text",
                                "id": "username",
                                "placeholder": "Your Name"
                            },
                            {
                                "type": "Input.Text",
                                "id": "useremail",
                                "placeholder": "Email Id",
                                "style": "Email"
                            },
                            {
                                "type": "Input.Text",
                                "id": "usermob",
                                "placeholder": "Mobile Number"
                            },
                            {
                                "type": "Input.Text",
                                "id": "useradd",
                                "placeholder": "Adress"
                            },
                            {
                                "type": "Input.Text",
                                "id": "userzip",
                                "placeholder": "Zip Code"
                            },
                            {
                                "type": "ActionSet",
                                "actions": [
                                    {
                                        "type": "Action.Submit",
                                        "title": "Buy Now",
                                        "style": "positive",
                                        "id": "userorder"
                                    }
                                ]
                            }
                        ]
                    })]
                });
                return Dialog.EndOfTurn;
            }else{
                await step.context.sendActivity({
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
                return await step.endDialog();
            }
        }else{
            await step.context.sendActivity({
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
            });
            return await step.endDialog();
        }
        
    }

    async response(step){
        if(step.context.activity.value){
            const newUser = new User({
            
                name:   step.context.activity.value.username,
                email:   step.context.activity.value.useremail,
                mobile: step.context.activity.value.usermob,
                address: step.context.activity.value.useradd,
                zip: step.context.activity.value.userzip
            });
            await newUser.save();
            await step.context.sendActivity("You order will be delievered.");
            await step.context.sendActivity({
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
            
        }else{
            await step.context.sendActivity({
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
        return await step.endDialog();
        
    }
    

    
    
}

module.exports.CartInfo = CartInfo;