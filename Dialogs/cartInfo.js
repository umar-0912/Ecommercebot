const {ComponentDialog, WaterfallDialog, DialogSet, DialogTurnStatus, Dialog, ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt} = require("botbuilder-dialogs");
const { CardFactory } = require('botbuilder');
const Cart = require("../model/cart");
const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const DATETIME_PROMPT  = 'DATETIME_PROMPT';
const cartInfoWF1 = 'productCatalogWF1';
const cartInfo = "productCatalog";
var endDialog = '';

class CartInfo extends ComponentDialog {
    constructor(conversationState){
        super(cartInfo);
        if(!conversationState) throw new Error ("Con state require");
        this.conversationState = conversationState;
        
        this.addDialog(new WaterfallDialog(cartInfoWF1,[
            this.sendCart.bind(this),
            this.shown.bind(this)
        ]));
        this.intialDialogId = cartInfoWF1;
    }

    async run(context, accessor){
        
            
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if(results && results.status === DialogTurnStatus.empty){
            await dialogContext.beginDialog(this.id);
        }
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
        if(step.context.activity.value.name){

        }else{
            endialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete(){
        return endDialog;
    }

    
    
}

module.exports.CartInfo = CartInfo;