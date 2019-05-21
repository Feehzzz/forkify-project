import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from  './views/searchView';
import * as recipeView from  './views/recipeView';
import * as listView from  './views/listView';


import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 *  search object
 *  current recipe object
 *  shopping list object
 *  liked recipes
 */ 

const state = {};
window.state = state;


const controlSearch = async () => {
    // get the query from the view
    const query = searchView.getInput();
    
    
    if(query){
        // new search object and add to state
        state.search = new Search(query);
        // prepare ui for results

        searchView.clearInput(); 
        searchView.clearResults();
        renderLoader(elements.searchRes);
        

        try {
            // search for recipes
        await state.search.getResults();

        // render results on ui
        clearLoader();
        searchView.renderResults(state.search.result);
        } catch ( err) {
            alert("some error ocurred" + err);
            clearLoader();
        }

    }
}
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();

});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/*
*/

const controlRecipe = async () => {
    // get id from url
    const id = window.location.hash.replace('#', '');
    if(id){
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search) searchView.highlightSelected(id);
        
        // create new recipe object
        state.recipe =  new Recipe(id);
      
        try {
            //get recipe data and parse ingredients
            await state.recipe.getRecipe();
            
            state.recipe.parseIngredients();

            // calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServing();
            // render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
            
        }catch (err) {
            alert(err)
        }
        
    }

}
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/*
List controller


*/

const controlList = () => {
    // create a new list if there in none yet
    if(!state.list) state.list = new List()

    // add each ingredient to the list and ui
    state.recipe.ingredients.forEach(el => {
        const item = state.list.additem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item event
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
     // delete from state 
    state.list.deleteItem(id);
     // delete from  ui
    listView.deleItem(id)
    // handle the count update
    } else if(e.target.matches('.shopping_count-value')){
        const val =  parseFloat(e.target.value, 10)
        state.list.updateCount(id, val);
    }
    
});

 // handling recipe button clicks
 elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
         // decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
            
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);

    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    }
    
});

