const {
    ComponentDialog,
    WaterfallDialog,
    DialogSet,
    DialogTurnStatus,
  } = require("botbuilder-dialogs");
 
  
  //Dialogs
  const { CartInfo } = require("./cartInfo");
  const { ProductCatalog } = require("./productCatalog");
  
  //Constants
  const rootDialog = "rootDialog";
  const productCatalog = "productCatalog";
  const cartInfo = "cartInfo";
  const rootDialogWf1 = "rootDialogWf1";
  
  class RootDialog extends ComponentDialog {
    constructor(conversationState) {
      super(rootDialog);
  
      if (!conversationState) throw new Error("Conversation State is not found");
      this.conversationState = conversationState;
      this.previousIntent = this.conversationState.createProperty("previousIntent");
      this.conversationData = this.conversationState.createProperty("conversationData");
  
      this.addDialog(
        new WaterfallDialog(rootDialogWf1, [this.routeMessages.bind(this)])
      );
  
  
      this.addDialog(new ProductCatalog(conversationState));
      this.addDialog(new CartInfo(conversationState));
  
      this.initialDialogId = rootDialogWf1;
    }
  
    async routeMessages(stepContext) {
        try {
            
            var currentIntent = '';
            const previousIntent = await this.previousIntent.get(stepContext.context,{});
            const conversationData = await this.conversationData.get(stepContext.context,{});
            
            if(previousIntent.intentName && conversationData.endDialog === false){
                currentIntent = previousIntent.intentName;
            }else if(previousIntent.intentName && conversationData.endDialog === true){
                currentIntent = stepContext.context.activity.text;   
            }else{
                currentIntent = stepContext.context.activity.text;
                await this.previousIntent.set(stepContext.context,{intentName: stepContext.context.activity.text});
            }
            

            switch (currentIntent) {
            case "Product Catalog":
                return await stepContext.beginDialog(productCatalog);
    
            case "Cart":
                return await stepContext.beginDialog(cartInfo);
    
            default:
                stepContext.context.sendActivity(
                "Sorry, I am still learning can you please refresh your query"
                );
                
            }
            return await stepContext.endDialog();

        } catch (error) {
            console.log(error);
        }
    }
  
    async run(context, accessor) {
      try {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results && results.status === DialogTurnStatus.empty) {
          await dialogContext.beginDialog(this.id);
        } else {
          console.log("Dialog Stack is Empty");
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  module.exports.RootDialog = RootDialog;
  







//////////////////////////////////////////
/*const { ComponentDialog, WaterfallDialog, DialogSet, DialogTurnStatus, Dialog } = require('botbuilder-dialogs');
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
        this.addDialog(new ProductCatalog(conversationState));
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
        console.log("hello there");
        
        switch(step.context.actvity.text){
            case 'Product Catalog':
            
            
            
            await step.beginDialog(productCatalog);
            
            

            
            // if(conversationData.endDialog){
            //     await this.previousIntent.set(step.context,{intentName: null});
            //     await step.context.sendActivity({
            //         attachments: [
            //             CardFactory.heroCard(
            //                 'These are the suggestions',
            //                 null,
            //                 CardFactory.actions([
            //                     {
            //                         type: 'imBack',
            //                         title: 'Product Catalog',
            //                         value: 'Product Catalog'
            //                     },
            //                     {
            //                         type: 'imBack',
            //                         title: 'Cart',
            //                         value:'Cart'
            //                     },
            //                     {
            //                         type: 'imBack',
            //                         title: 'FAQs',
            //                         value:'FAQs'
            //                     }
            //                 ])
            //             )
            //         ]
            //     })
            // }
            break;
            case 'Cart':   
            await this.conversationData.set(step.context, {endDialog: false})
            await this.dialog1.run(step.context, this.accessor);
            conversationData.endDialog = await this.dialog.isDialogComplete();
            if(conversationData.endDialog){
                await this.previousIntent.set(step.context,{intentName: null});
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
            break;
            default:
                console.log("Did not match Make Reservation case");
                break;
        }
        return await step.endDialog();
    }
}

module.exports.RootDialog = RootDialog;*/