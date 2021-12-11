"use strict";

let basket = {};

/* clears basket (and by extension local storage) */
function clearBasket()
{
    localStorage.clear();
    document.querySelectorAll('basket-item').forEach(item => item.remove());
    if (document.getElementsByTagName("basket-item").length < 1)
    {
        var basket_empty = document.getElementById("basket-placeholder");
        basket_empty.style.display = "block";
        var basket_price = document.getElementById("basket-placeholder");
        basket_price.style.display = "none";
    }
}

/* reloads the basket after page reload or refresh */
function fillBasket()
{
    if (localStorage.getItem("basket"))
    {
        basket = JSON.parse(localStorage.getItem("basket"));
        Object.keys(basket).forEach(key =>
            {
                addBasketItem(key, basket[key]);
            }
        )
    }
}

/* on page load, loads the menu items and the basket items */
async function loadMenuItems(url)
{
    const response = await fetch(url);
    let menuItems = await response.json();
    localStorage.setItem("menu", JSON.stringify(menuItems));
    sortMenuItems("a-z");
    fillBasket();
}

/* various sortings of menu items, using local storage */
function sortMenuItems(sort)
{
    let menuItems = JSON.parse(localStorage.getItem("menu"));
    document.getElementById("menu-items").innerHTML = "";
    switch(sort)
    {
        case "a-z":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (a.title < b.title) ? -1 : ((a.title > b.title) ? 1 : 0))));
            break;
        case "z-a":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (b.title < a.title) ? -1 : ((b.title > a.title) ? 1 : 0))));
            break;
        case "0-9":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (a.price < b.price) ? -1 : ((a.price > b.price) ? 1 : 0))));
            break;
        case "9-0":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (b.price < a.price) ? -1 : ((b.price > a.price) ? 1 : 0))));
            break;
    }
    listMenuItems();
}

/* listing available pizzae in the menu */
async function listMenuItems()
{
    var newDiv;
    let menuItems = JSON.parse(localStorage.getItem("menu"));
    menuItems.forEach(pizza => {
            newDiv = document.createElement("menu-item");
            newDiv.setAttribute("id", pizza.title);
            let ingredients = "";
            pizza.ingredients.forEach(ingredient =>
                {
                    ingredients = ingredients + ingredient + ", ";
                }
            );
            ingredients = ingredients.slice(0,-2)
            newDiv.innerHTML = `<img src="`+pizza.image+`">
                <div class="title-price"><div class="title">`+pizza.title+`</div>
                <div class="price">`+(pizza.price).toLocaleString("pl-PL")+`0 zł</div></div>
                <ingr>`+ingredients+`</ingr>
                <button onClick="addBasketItemFromAButton(this);calculateBasket()">Zamów</button>`;
            document.getElementById("menu-items").appendChild(newDiv);
        });
}

/* adds a div with pizza to the orders */
/* the arguments are: the menu <pizza> element, and how many pizzae of this kind is being ordered */
function addBasketItem(title, count)
{
    console.log(title+` `+count);
    const menu = JSON.parse(localStorage.getItem("menu"));
    let item = menu.filter(item => {return item.title == title })[0];
    let newDiv = document.createElement("basket-item");
    newDiv.setAttribute("id", "Ó"+item.title);
    newDiv.innerHTML = `<div class="basket-item-title">`+item.title+`</div>
            <div class="basket-item-price">`+item.price+`</div>
            <div class="basket-item-count">` +count+ `</div>
            <div class="basket-item-delete" onClick="removeBasketItem(this);calculateBasket()">×</div>`;
    document.getElementById("basket-items").appendChild(newDiv);
    if(!!document.getElementById("basket-placeholder"))
    {
        var basket_empty = document.getElementById("basket-placeholder");
        basket_empty.style.display = "none";
        var basket_price = document.getElementById("basket-summary");
        basket_price.style.display = "block";
    }
}

/* adds a pizza from the button in menu to the orders */
function addBasketItemFromAButton(button)
{
    let title = button.parentNode.id;
    if (title in basket)
    {
        let count = ++basket[title];
        document.getElementById("Ó"+title).querySelector("div.basket-item-count").innerHTML = count;
    }
    else
    {
        basket[title] = 1;
        addBasketItem(title, 1);
    }
    localStorage.setItem("basket", JSON.stringify(basket));
    
}

/* counts down an item from the basket and removes upon reaching 0 */
function removeBasketItem(button)
{
    let title = (button.parentNode.id).substring(1);
    let count = --basket[title];
    button.parentNode.querySelector("div.basket-item-count").innerHTML = count;
    if (!count)
    {
        let basketItem = button.parentNode;
        basketItem.parentNode.removeChild(basketItem);
        delete basket[title];
        if (document.getElementsByTagName("basket-item").length < 1)
        {
            var basket_empty = document.getElementById("basket-placeholder");
            basket_empty.style.display = "block";
            var basket_price = document.getElementById("basket-summary");
            basket_price.style.display = "none";
        }
    }
    localStorage.setItem("basket",JSON.stringify(basket));
}


/* calculating the total cost of the orders */
function calculateBasket()
{
    var total_price = 0;
    var a, b;
    var prices = document.getElementsByClassName("basket-item-price");
    var counts = document.getElementsByClassName("basket-item-count");
    for (let index = 0; index < prices.length; index++) 
    {
        a = parseFloat(prices[index].innerHTML.replace(",",".").replace(" zł",""));
        b = parseInt(counts[index].innerHTML);
        total_price = total_price + a*b;
    }
    document.getElementById("basket-summary-number").innerHTML = total_price.toFixed(1).replace(".",",")+"0 zł";
}

/* filtering menu items by ingredients */
function filter()
{
    var check, ingr;
    var pizzae = document.getElementById("menu-items");
    var ingredients = document.getElementById("ingredients").value.toLowerCase()
        .split(', ');
    var pizzae1 = pizzae.getElementsByTagName("menu-item");
    for(var i= 0; i < pizzae1.length; i++)
    {
        pizzae1[i].style.display = "inline-block";
    }
    if (!(ingredients[0] == ""))
    {
        for (var i = 0; i < pizzae1.length; i++)
        {
            check = true;
            ingr = pizzae1[i].querySelector("ingr").innerText.split(', ');
            ingredients.forEach( ingredient =>
                check = check && ingr.find(element => { 
                    if(element.includes(ingredient))
                    {
                        return true;
                    }
                }));
            if(!check)
            {
                pizzae1[i].style.display = "none";
            }
            else
            {
                pizzae1[i].style.display = "inline-block";
            }
        }
    }
}

/* shows basket after clicking "Twój koszyk" */
function showMobileBasket()
{
    var x = document.getElementById("basket");
    x.style.display = "block";
}

document.querySelector("body").addEventListener("load",
 loadMenuItems(`https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json`));