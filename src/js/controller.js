import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import { async } from 'regenerator-runtime';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
if (module.hot) {
  module.hot.accept();
  // module.hot.accept('./model.js', () => {
  //   import('./model.js')
  //    .then(({ default: model }) => {
  //       console.log('Model reloaded');
  //       controlRecipes();
  //     })
  //    .catch(err => console.error(err));
  // });
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) return;
    recipeView.renderSpinner();
    //0 result view
    resultsView.update(model.getSearchResultsPage()); //

    //updating bookmark view
    bookmarksView.update(model.state.bookmarks);

    //1 Loading recipe
    await model.loadRecipe(id);

    //2  rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //load search results
    await model.loadSearchResults(query);

    //render search results
    // console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //render pagination
    paginationView.render(model.state.search);
    // paginationView.addHandlerClick(changePage);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render new pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // console.log(model.state.recipe);
  // update recipe view
  recipeView.update(model.state.recipe);

  //3) render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);

  //upload new recipe data
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    // if (Object.keys(model.state.recipe).length !== 0)
    recipeView.render(model.state.recipe);

    //succcess message
    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      // addRecipeView.resetForm();
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }

  //  .then(res => {
  //     console.log(res);
  //     // render recipe
  //     recipeView.render(res.data.recipe);
  //     // update bookmarks
  //     bookmarksView.update(model.state.bookmarks);
  //   })
  //  .catch(err => console.error(err));
};
const init = function () {
  addRecipeView.addHandlerUpload(controlAddRecipe);
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerRender(controlRecipes);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
};
init();
