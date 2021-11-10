const { ComponentDialog, WaterfallDialog, DialogSet, DialogTurnStatus, Dialog } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const Product = require("../model/product");
const Cart = require("../model/cart");
const { ProductCatalog } = require('./productCatalog');
const {CartInfo} = require('./cartInfo');

const rootDialogWF1 = 'rootDialogWF1';
const rootDialog = "rootDialog";


class RootDialog extends ComponentDialog {
    
    constructor(conversationState){
        super(rootDialog);
        if(!conversationState) throw new Error ("Con state require");
        this.conversationState = conversationState;
        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty("conversationData");
        this.obj = new ProductCatalog(conversationState);
        this.addDialog(this.obj);
        this.addDialog(new CartInfo(conversationState));
        this.addDialog(new WaterfallDialog(rootDialogWF1,[
            this.step1.bind(this),
        ]));
        this.intialDialogId = rootDialogWF1;
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

    async step1(step){
        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{});

        if(previousIntent.intentName && conversationData.endDialog === false){
            currentIntent = previousIntent.intentName;
        }else if(previousIntent.intentName && conversationData.endDialog === true){
            currentIntent = context.activity.text;   
        }else{
            currentIntent = context.activity.text;
            await this.previousIntent.set(context,{intentName: context.activity.text});
        }
        console.log("hi");
        
        switch(currentIntent){
            case 'Product Catalog':
            
            await this.conversationData.set(context, {endDialog: false})
            
            await step.run(this.obj);
            
            conversationData.endDialog =  this.obj.isDialogComplete();

            
            if(conversationData.endDialog){
                await this.previousIntent.set(context,{intentName: null});
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
            break;
            case 'Cart':   
            await this.conversationData.set(context, {endDialog: false})
            await this.dialog1.run(context, this.accessor);
            conversationData.endDialog = await this.dialog.isDialogComplete();
            if(conversationData.endDialog){
                await this.previousIntent.set(context,{intentName: null});
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
            break;
            default:
                console.log("Did not match Make Reservation case");
                break;
        }
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;