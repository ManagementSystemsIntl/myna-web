require 'test_helper'

class SurveyFamiliesControllerTest < ActionController::TestCase
  setup do
    @survey_family = survey_families(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:survey_families)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create survey_family" do
    assert_difference('SurveyFamily.count') do
      post :create, survey_family: {  }
    end

    assert_redirected_to survey_family_path(assigns(:survey_family))
  end

  test "should show survey_family" do
    get :show, id: @survey_family
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @survey_family
    assert_response :success
  end

  test "should update survey_family" do
    patch :update, id: @survey_family, survey_family: {  }
    assert_redirected_to survey_family_path(assigns(:survey_family))
  end

  test "should destroy survey_family" do
    assert_difference('SurveyFamily.count', -1) do
      delete :destroy, id: @survey_family
    end

    assert_redirected_to survey_families_path
  end
end
