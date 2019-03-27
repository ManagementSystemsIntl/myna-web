require 'test_helper'

class PouchKeysControllerTest < ActionController::TestCase
  setup do
    @pouch_key = pouch_keys(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:pouch_keys)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create pouch_key" do
    assert_difference('PouchKey.count') do
      post :create, pouch_key: {  }
    end

    assert_redirected_to pouch_key_path(assigns(:pouch_key))
  end

  test "should show pouch_key" do
    get :show, id: @pouch_key
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @pouch_key
    assert_response :success
  end

  test "should update pouch_key" do
    patch :update, id: @pouch_key, pouch_key: {  }
    assert_redirected_to pouch_key_path(assigns(:pouch_key))
  end

  test "should destroy pouch_key" do
    assert_difference('PouchKey.count', -1) do
      delete :destroy, id: @pouch_key
    end

    assert_redirected_to pouch_keys_path
  end
end
