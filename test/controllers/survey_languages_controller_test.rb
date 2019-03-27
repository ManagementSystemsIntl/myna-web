require 'test_helper'

class SurveyLanguagesControllerTest < ActionController::TestCase
  setup do
    @survey_language = survey_languages(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:survey_languages)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create survey_language" do
    assert_difference('SurveyLanguage.count') do
      post :create, survey_language: {  }
    end

    assert_redirected_to survey_language_path(assigns(:survey_language))
  end

  test "should show survey_language" do
    get :show, id: @survey_language
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @survey_language
    assert_response :success
  end

  test "should update survey_language" do
    patch :update, id: @survey_language, survey_language: {  }
    assert_redirected_to survey_language_path(assigns(:survey_language))
  end

  test "should destroy survey_language" do
    assert_difference('SurveyLanguage.count', -1) do
      delete :destroy, id: @survey_language
    end

    assert_redirected_to survey_languages_path
  end
end
