require 'test_helper'

class SurveyTargetsControllerTest < ActionController::TestCase
  setup do
    @survey_target = survey_targets(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:survey_targets)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create survey_target" do
    assert_difference('SurveyTarget.count') do
      post :create, survey_target: {  }
    end

    assert_redirected_to survey_target_path(assigns(:survey_target))
  end

  test "should show survey_target" do
    get :show, id: @survey_target
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @survey_target
    assert_response :success
  end

  test "should update survey_target" do
    patch :update, id: @survey_target, survey_target: {  }
    assert_redirected_to survey_target_path(assigns(:survey_target))
  end

  test "should destroy survey_target" do
    assert_difference('SurveyTarget.count', -1) do
      delete :destroy, id: @survey_target
    end

    assert_redirected_to survey_targets_path
  end
end
