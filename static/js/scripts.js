"use strict";

let basket = {};
let menu = [];

/* reloads the basket after page reload or refresh */
function fillBasket()
{
    if (localStorage.getItem("basket"))
    {
        basket = JSON.parse(localStorage.getItem("basket"));
        listBasketItems();
    }
}

/* on page load, loads the menu items and the basket items */
async function loadMenuItems(url)
{
    fetch(url).then((response) => response.json())
        .then((response) => menu = response.map(item => ({...item, filtered: true})))
        .then(() => sortMenuItems())
        .then(() => fillBasket());
}

/* various sortings of menu items, using local storage */
function sortMenuItems()
{
    //let menuItems = JSON.parse(localStorage.getItem("menu"));
    document.getElementById("menu-items").innerHTML = "";
    let selection = document.querySelector(".sortings-list");
    switch(selection.options[selection.selectedIndex].id)
    {
        case "a-z":
            menu.sort((a, b) =>
                (a.title < b.title) ? -1 : ((a.title > b.title) ? 1 : 0));
            break;
        case "z-a":
            menu.sort((a, b) =>
                (b.title < a.title) ? -1 : ((b.title > a.title) ? 1 : 0));
            break;
        case "zeronine":
            menu.sort((a, b) =>
                (a.price < b.price) ? -1 : ((a.price > b.price) ? 1 : 0));
            break;
        case "ninezero":
            menu.sort((a, b) =>
                (b.price < a.price) ? -1 : ((b.price > a.price) ? 1 : 0));
            break;
    }
    listMenuItems(menu);
}

/* listing available pizzae in the menu */
function listMenuItems(menuItems)
{
    var newDiv;
    menuItems.forEach(pizza => {
            if (pizza.filtered == true)
            {
                newDiv = document.createElement("menu-item");
                newDiv.setAttribute("id", pizza.title);
                let ingredients = "";
                ingredients = pizza.ingredients.join(", ");
                newDiv.innerHTML = `<img src="`+pizza.image+`">
                    <div class="title-price"><div class="title">`+pizza.title+`</div>
                    <div class="price">`+(pizza.price).toLocaleString("pl-PL")+`0 z??</div></div>
                    <ingr>`+ingredients+`</ingr>
                    <button class="menu-item-btn">Zam??w</button>`;
                document.getElementById("menu-items").appendChild(newDiv);
            }
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

/* renders basket items */
function listBasketItems()
{
    console.log("pilnuj koszyka");
    document.getElementById("basket-items").innerHTML = "";
    Object.keys(basket).forEach(key => {
        if(basket[key][0] > 0)
        {
            let newDiv = document.createElement("basket-item");
            newDiv.setAttribute("id", "??"+key);
            newDiv.innerHTML = `<div class="basket-item-title">`+key+`</div>
                <div class="basket-item-price">`+basket[key][1].toLocaleString("pl-PL")+` z??</div>
                <div class="basket-item-count">`+basket[key][0]+`</div>
                <div class="basket-item-delete">??</div>`;
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
    let totalPrice = 0;
    Object.keys(basket).forEach(key => {
        totalPrice += basket[key][0] * basket[key][1]
    });
    document.getElementById("basket-summary-number").innerHTML = totalPrice.toFixed(1).replace(".",",")+"0 z??";
}

/* filtering menu items by ingredients */
function filterItems()
{
    let input = document.getElementById("ingredients").value.toLowerCase()
    .split(', ');
    document.getElementById("menu-items").innerHTML="";
    var check;
    for(let i = 0; i < menu.length; i++)
    {
        check = true;
        input.forEach( input_element =>
            check = check && menu[i].ingredients.find(ingredient => { 
                if(ingredient.includes(input_element))
                {
                    return true;
                }
            }));
        if(check)
        {
            menu[i].filtered = true;
        }
        else
        {
            menu[i].filtered = false;
        }
    }
    listMenuItems(menu);
}

/* shows basket after clicking "Tw??j koszyk" */
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

/* ALL THEM LISTENERS */

/* onload */
document.querySelector("body").addEventListener("load", loadMenuItems('https://raw.githubusercontent.com/alexsimkovich/patronage/main/api/data.json'));

/* basket */
document.querySelector("#hidden-basket-btn").addEventListener("click", showMobileBasket);
document.querySelector("#basket-clear").addEventListener("click", clearBasket);
document.querySelector(".basket-hide").addEventListener("click", hideMobileBasket);

/* sort menu dropdown */
document.querySelector(".sortings-list").onchange = sortMenuItems;

/* filtering */
document.querySelector("#ingredients").addEventListener("keyup",filterItems);