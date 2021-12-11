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
        console.log(Object.keys(localStorage));
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

/* loads pizzae from the JSON and returns ready array of pizza objects */
async function loadMenuItems(url)
{
    const response = await fetch(url);
    const pizzae = await response.json();
    return pizzae;
}

/* initial menu items sorting; called in listPizzae() */
function sortMenuItems(a, b)
{
    if (a.title < b.title)
    {
        return -1;
    }
    if (a.title > b.title)
    {
        return 1;
    }
    return 0;
}

function sortPizzaAZ()
{
    var pizzae = document.getElementById("menu-items");
    var run = true;
    var stop, pizzae1;
    while(run)
    {
        run = false;
        pizzae1 = pizzae.getElementsByTagName("menu-item");
        for (var i = 0; i < (pizzae1.length - 1); i++)
        {
            stop = false;
            if (pizzae1[i].querySelector("div.title-price div.title").innerHTML.toLowerCase() > 
            pizzae1[i + 1].querySelector("div.title-price div.title").innerHTML.toLowerCase()){
                    stop = true;
                    break;
                    }
        }
        if (stop)
        {
            pizzae1[i].parentNode.insertBefore(pizzae1[i + 1], pizzae1[i]);
            run = true;
        }
    }
}

function sortPizzaZA()
{
    var pizzae = document.getElementById("menu-items");
    var run = true;
    var stop, pizzae1;
    while(run)
    {
        run = false;
        pizzae1 = pizzae.getElementsByTagName("menu-item");
        for (var i = 0; i < (pizzae1.length - 1); i++)
        {
            stop = false;
            if (pizzae1[i].querySelector("div.title-price div.title").innerHTML.toLowerCase() < 
                    pizzae1[i + 1].querySelector("div.title-price div.title").innerHTML.toLowerCase()){
                    stop = true;
                    break;
                    }
        }
        if (stop)
        {
            pizzae1[i].parentNode.insertBefore(pizzae1[i + 1], pizzae1[i]);
            run = true;
        }
    }
}

function sortPizza09()
{
    var pizzae = document.getElementById("menu-items");
    var run = true;
    var stop, pizzae1;
    while(run)
    {
        run = false;
        pizzae1 = pizzae.getElementsByTagName("menu-item");
        for (var i = 0; i < (pizzae1.length - 1); i++)
        {
            stop = false;
            if (pizzae1[i].querySelector("div.title-price div.price").innerHTML.toLowerCase() > 
            pizzae1[i + 1].querySelector("div.title-price div.price").innerHTML.toLowerCase()){
                    stop = true;
                    break;
                    }
        }
        if (stop)
        {
            pizzae1[i].parentNode.insertBefore(pizzae1[i + 1], pizzae1[i]);
            run = true;
        }
    }
}

function sortPizza90()
{
    var pizzae = document.getElementById("menu-items");
    var run = true;
    var stop, pizzae1;
    while(run)
    {
        run = false;
        pizzae1 = pizzae.getElementsByTagName("menu-item");
        for (var i = 0; i < (pizzae1.length - 1); i++)
        {
            stop = false;
            if (pizzae1[i].querySelector("div.title-price div.price").innerHTML.toLowerCase() < 
                    pizzae1[i + 1].querySelector("div.title-price div.price").innerHTML.toLowerCase()){
                    stop = true;
                    break;
                    }
        }
        if (stop)
        {
            pizzae1[i].parentNode.insertBefore(pizzae1[i + 1], pizzae1[i]);
            run = true;
        }
    }
}

/* listing available pizzae in the menu */
async function listMenuItems()
{
    var newDiv;
    var pizzae = await loadMenuItems('https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json');
    pizzae = pizzae.sort(sortMenuItems);
    pizzae.forEach(pizza => {
            newDiv = document.createElement("menu-item");
            newDiv.setAttribute("id", pizza.title);
            var ingredients1 = "";
            pizza.ingredients.forEach(ingredient =>
                {
                    ingredients1 = ingredients1 + ingredient + ", ";
                }
            );
            ingredients1 = ingredients1.slice(0,-2)
            newDiv.innerHTML = '<img src="'+pizza.image+'">'
                +'<div class="title-price"><div class="title">'+pizza.title+'</div>'
                +'<div class="price">'+(pizza.price).toLocaleString("pl-PL")+'0 zł</div></div>'
                +'<ingr>'+ingredients1+'</ingr>'
                +'<button onClick="addPizzaButton(this);calculateBasket()">Zamów</button>';
            document.getElementById("menu-items").appendChild(newDiv);
        });
    fillBasket();
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