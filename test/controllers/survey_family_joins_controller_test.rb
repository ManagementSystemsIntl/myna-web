require 'test_helper'

class SurveyFamilyJoinsControllerTest < ActionController::TestCase
  setup do
    @survey_family_join = survey_family_joins(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:survey_family_joins)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create survey_family_join" do
    assert_difference('SurveyFamilyJoin.count') do
      post :create, survey_family_join: {  }
    end

    assert_redirected_to survey_family_join_path(assigns(:survey_family_join))
  end

  test "should show survey_family_join" do
    get :show, id: @survey_family_join
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @survey_family_join
    assert_response :success
  end

  test "should update survey_family_join" do
    patch :update, id: @survey_family_join, survey_family_join: {  }
    assert_redirected_to survey_family_join_path(assigns(:survey_family_join))
  end

  test "should destroy survey_family_join" do
    assert_difference('SurveyFamilyJoin.count', -1) do
      delete :destroy, id: @survey_family_join
    end

    assert_redirected_to survey_family_joins_path
  end
end
