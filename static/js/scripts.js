"use strict";

let basket = {};

/* reloads the basket after page reload or refresh */
function fillBasket()
{
    if (localStorage.getItem("basket"))
    {
        listBasketItems();
    }
}

/* on page load, loads the menu items and the basket items */
async function loadMenuItems(url)
{
    const response = await fetch(url);
    let menuItems = await response.json();
    localStorage.setItem("menu", JSON.stringify(menuItems));
    sortMenuItems(document.querySelector("#a-z"));
    fillBasket();
}

/* various sortings of menu items, using local storage */
function sortMenuItems(sort)
{
    let menuItems = JSON.parse(localStorage.getItem("menu"));
    document.getElementById("menu-items").innerHTML = "";
    switch(sort.id)
    {
        case "a-z":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (a.title < b.title) ? -1 : ((a.title > b.title) ? 1 : 0))));
            break;
        case "z-a":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (b.title < a.title) ? -1 : ((b.title > a.title) ? 1 : 0))));
            break;
        case "zeronine":
            localStorage.setItem("menu", JSON.stringify(menuItems.sort((a, b) =>
                (a.price < b.price) ? -1 : ((a.price > b.price) ? 1 : 0))));
            break;
        case "ninezero":
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
                <button class="menu-item-btn">Zamów</button>`;
            document.getElementById("menu-items").appendChild(newDiv);
        });
    document.querySelectorAll(".menu-item-btn").forEach( button =>
            button.addEventListener("click", function(e){addBasketItem(this)}));

    document.querySelectorAll(".menu-item-btn").forEach( button =>
            button.addEventListener("click", calculateBasket));

}

/* adds a pizza from the button in menu to the orders */
function addBasketItem(button)
{
    let title = button.parentNode.id;
    if(!(basket[title]))
    {
        const menu = JSON.parse(localStorage.getItem("menu"));
        let item = menu.filter(item => {return item.title == title })[0];
        basket[title] = [1, item.price];
    }
    else
    {
        basket[title][0]++;
    }
    listBasketItems();
    localStorage.setItem("basket", JSON.stringify(basket));
    
}

function listBasketItems()
{
    document.getElementById("basket-items").innerHTML = "";
    Object.keys(basket).forEach(key => {
        if(basket[key][0] > 0)
        {
            let newDiv = document.createElement("basket-item");
            newDiv.setAttribute("id", "Ó"+key);
            newDiv.innerHTML = `<div class="basket-item-title">`+key+`</div>
                <div class="basket-item-price">`+basket[key][1].toLocaleString("pl-PL")+` zł</div>
                <div class="basket-item-count">`+basket[key][0]+`</div>
                <div class="basket-item-delete">×</div>`;
            newDiv.querySelector(".basket-item-delete").addEventListener("click", function(e){removeBasketItem(this)});
            newDiv.querySelector(".basket-item-delete").addEventListener("click", calculateBasket);
            document.getElementById("basket-items").appendChild(newDiv);
        }
    });
    if (document.querySelectorAll("basket-item").length > 0)
    {
        document.getElementById("basket-placeholder")
            .classList.add("display-hide");
        document.querySelector(".basket-summary")
            .classList.remove("display-hide");
    }
}

/* counts down an item from the basket and removes upon reaching 0 */
function removeBasketItem(button)
{
    let title = (button.parentNode.id).substring(1);
    --basket[title][0];
    listBasketItems();
    if (document.getElementsByTagName("basket-item").length < 1)
    {
        document.getElementById("basket-placeholder")
            .classList.remove("display-hide");
        document.querySelector(".basket-summary")
            .classList.add("display-hide");
    }
    localStorage.setItem("basket",JSON.stringify(basket));
}

/* clears basket (and by extension local storage) */
function clearBasket()
{
    localStorage.removeItem("basket");
    basket = {};
    document.querySelectorAll('basket-item').forEach(item => item.remove());
    document.getElementById("basket-placeholder")
        .classList.remove("display-hide");
    document.querySelector(".basket-summary")
        .classList.add("display-hide");
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
    document.querySelector(".basket")
        .classList.add("mobile-basket-show");
}

function hideMobileBasket()
{
    document.querySelector(".basket")
        .classList.remove("mobile-basket-show");
}

/* all them listeners */

document.querySelector("body").addEventListener("load",
 loadMenuItems(`https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json`));
document.querySelector("#hidden-basket-btn").addEventListener("click", showMobileBasket);
document.querySelector("#basket-clear").addEventListener("click", clearBasket);
document.querySelector("#a-z").addEventListener("click", function(e) {sortMenuItems(this)});
document.querySelector("#z-a").addEventListener("click", function(e) {sortMenuItems(this)});
document.querySelector("#zeronine").addEventListener("click", function(e) {sortMenuItems(this)});
document.querySelector("#ninezero").addEventListener("click", function(e) {sortMenuItems(this)});
document.querySelector(".basket-hide").addEventListener("click", hideMobileBasket);