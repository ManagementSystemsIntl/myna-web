require 'test_helper'

class SectionsControllerTest < ActionController::TestCase
  setup do
    @section = sections(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:sections)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create section" do
    assert_difference('Section.count') do
      post :create, section: { autostop: @section.autostop, code: @section.code, code_name: @section.code_name, json_schema: @section.json_schema, name: @section.name, order: @section.order, skippable: @section.skippable, survey_id: @section.survey_id, timer_value: @section.timer_value }
    end

    assert_redirected_to section_path(assigns(:section))
  end

  test "should show section" do
    get :show, id: @section
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @section
    assert_response :success
  end

  test "should update section" do
    patch :update, id: @section, section: { autostop: @section.autostop, code: @section.code, code_name: @section.code_name, json_schema: @section.json_schema, name: @section.name, order: @section.order, skippable: @section.skippable, survey_id: @section.survey_id, timer_value: @section.timer_value }
    assert_redirected_to section_path(assigns(:section))
  end

  test "should destroy section" do
    assert_difference('Section.count', -1) do
      delete :destroy, id: @section
    end

    assert_redirected_to sections_path
  end
end
