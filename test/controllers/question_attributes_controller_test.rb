require 'test_helper'

class QuestionAttributesControllerTest < ActionController::TestCase
  setup do
    @question_attribute = question_attributes(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:question_attributes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create question_attribute" do
    assert_difference('QuestionAttribute.count') do
      post :create, question_attribute: { name: @question_attribute.name, question_id: @question_attribute.question_id, question_option_id: @question_attribute.question_option_id, value: @question_attribute.value }
    end

    assert_redirected_to question_attribute_path(assigns(:question_attribute))
  end

  test "should show question_attribute" do
    get :show, id: @question_attribute
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @question_attribute
    assert_response :success
  end

  test "should update question_attribute" do
    patch :update, id: @question_attribute, question_attribute: { name: @question_attribute.name, question_id: @question_attribute.question_id, question_option_id: @question_attribute.question_option_id, value: @question_attribute.value }
    assert_redirected_to question_attribute_path(assigns(:question_attribute))
  end

  test "should destroy question_attribute" do
    assert_difference('QuestionAttribute.count', -1) do
      delete :destroy, id: @question_attribute
    end

    assert_redirected_to question_attributes_path
  end
end
