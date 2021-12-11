"use strict";

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
    if(!(localStorage.length == 0))
    {
        let stored_keys = Object.keys(localStorage).filter(k => k.startsWith('Ó'));
        for(var i = 0; i < stored_keys.length; i++)
        {
            var title = stored_keys[i].substring(1);
            if(!(document.getElementById(stored_keys[i])))
            {
                addBasketItem(document.getElementById(title), localStorage.getItem(stored_keys[i]));
            }
        }
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
                <button onClick="addPizzaButton(this);calculateBasket()">Zamów</button>`;
            document.getElementById("menu-items").appendChild(newDiv);
        });
}

/* adds a div with pizza to the orders */
/* the arguments are: the menu <pizza> element, and how many pizzae of this kind is being ordered */
function addBasketItem(pizza, count)
{
    var title = pizza.querySelector("div.title-price div.title").innerHTML;
    var price = pizza.querySelector("div.title-price div.price").innerHTML;
        let newDiv = document.createElement("basket-item");
        newDiv.setAttribute("id", "Ó"+title);
        newDiv.innerHTML = '<div class="basket-item-title">'+title+'</div>'
            + '<div class="basket-item-price">'+price+'</div>'
            + '<div class="basket-item-count">' +count+ '</div>'
            + '<div class="basket-item-delete" onClick="removeBasketItem(this);calculateBasket()">×</div>';
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
function addPizzaButton(button)
{
    var title = button.parentNode.id;
    var count = 1;
    if(!(document.getElementById("Ó"+title)))
    {
        addBasketItem(button.parentNode, count);
        localStorage.setItem("Ó"+title, 1);
    }
    else
    {
        var count = document.getElementById("Ó"+title).querySelector("div.basket-item-count").innerHTML;
        count++;
        document.getElementById("Ó"+title).querySelector("div.basket-item-count").innerHTML = count;
        localStorage.setItem("Ó"+title, count);
    }
}

/* removes an item from the basket */
function removeBasketItem(button)
{
    var count = parseInt(button.parentNode
        .querySelector("div.basket-item-count").innerHTML);
    count--;
    button.parentNode.querySelector("div.basket-item-count").innerHTML = count;
    if (!count)
    {
        let order = button.parentNode;
        order.parentNode.removeChild(order);
        localStorage.removeItem(order);
        if (document.getElementsByTagName("basket-item").length < 1)
        {
            var basket_empty = document.getElementById("basket-placeholder");
            basket_empty.style.display = "block";
            var basket_price = document.getElementById("basket-summary");
            basket_price.style.display = "none";
        }
    }
    else
    {
        localStorage.setItem(button.parentNode.id,count);
    }
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