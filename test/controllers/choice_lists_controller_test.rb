require 'test_helper'

class ChoiceListsControllerTest < ActionController::TestCase
  setup do
    @choice_list = choice_lists(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:choice_lists)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create choice_list" do
    assert_difference('ChoiceList.count') do
      post :create, choice_list: {  }
    end

    assert_redirected_to choice_list_path(assigns(:choice_list))
  end

  test "should show choice_list" do
    get :show, id: @choice_list
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @choice_list
    assert_response :success
  end

  test "should update choice_list" do
    patch :update, id: @choice_list, choice_list: {  }
    assert_redirected_to choice_list_path(assigns(:choice_list))
  end

  test "should destroy choice_list" do
    assert_difference('ChoiceList.count', -1) do
      delete :destroy, id: @choice_list
    end

    assert_redirected_to choice_lists_path
  end
end
