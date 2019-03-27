require 'test_helper'

class SurveyGroupsControllerTest < ActionController::TestCase
  setup do
    @survey_group = survey_groups(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:survey_groups)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create survey_group" do
    assert_difference('SurveyGroup.count') do
      post :create, survey_group: { client_id: @survey_group.client_id, name: @survey_group.name }
    end

    assert_redirected_to survey_group_path(assigns(:survey_group))
  end

  test "should show survey_group" do
    get :show, id: @survey_group
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @survey_group
    assert_response :success
  end

  test "should update survey_group" do
    patch :update, id: @survey_group, survey_group: { client_id: @survey_group.client_id, name: @survey_group.name }
    assert_redirected_to survey_group_path(assigns(:survey_group))
  end

  test "should destroy survey_group" do
    assert_difference('SurveyGroup.count', -1) do
      delete :destroy, id: @survey_group
    end

    assert_redirected_to survey_groups_path
  end
end
