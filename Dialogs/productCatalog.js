const { ComponentDialog, WaterfallDialog, DialogSet, DialogTurnStatus, Dialog } = require('botbuilder-dialogs');
const { CardFactory } = require('botbuilder');
const Product = require("../model/product");
const Cart = require("../model/cart");

const productCatalogWF1 = 'productCatalogWF1';
const productCatalog = "productCatalog";
var endDialog = '';

class ProductCatalog extends ComponentDialog {
    constructor(conversationState){
        super(productCatalog);
        if(!conversationState) throw new Error ("Con state require");
        this.conversationState = conversationState;
        this.addDialog(new WaterfallDialog(productCatalogWF1,[
            this.sendProductList.bind(this),
            this.shown.bind(this)
        ]));
        this.intialDialogId = productCatalogWF1;
    }


    async sendProductList(step){
        endDialog = false;
        try{
            const prods = await Product.find();
            let attachments=[];
            for (let i = 0; i < prods.length; i++) {
                
                let prod = prods[i];
            
                attachments.push(CardFactory.adaptiveCard({
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
                                                        "url": prod.url||" ",
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
                                                    }
                                                ]
                                            }
                                            
                                        ]
                                    },
                                    {
                                        "type": "Input.Number",
                                        "id": "quantity",
                                        "placeholder": "Quantity"
                                    },
                                    {
                                        "type": "ActionSet",
                                        "actions": [
                                            {
                                                "type": "Action.Submit",
                                                "title": "Add to cart",
                                                "data": {
                                                    "name":prod.name||" ",
                                                    "price":prod.price||" ",
                                                    "image":prod.url|| " "
                                                }
                                            }
                                        ]   
                                    }    
                            ]
                        }))
                    
                
                
                
            }
            await step.context.sendActivity({
                attachments: attachments})
            return Dialog.EndOfTurn; 
        }catch(error){
            console.log(error);
        }
        
    }

    async shown(step){
        const name = step.context.activity.value.name;
        const item = await Cart.findOne({ name });
        if(item){
            item.quantity = step.context.activity.value.quantity
            await item.save();
        }else{
            const newItem = new Cart({
                
                name:   step.context.activity.value.name,
                price: step.context.activity.value.price,
                url: step.context.activity.value.image,
                quantity: step.context.activity.value.quantity
            });
            await newItem.save();
        }
        
        endDialog = true;
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

    
    
}

module.exports.ProductCatalog = ProductCatalog;