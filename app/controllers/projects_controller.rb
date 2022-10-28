class ProjectsController < ApplicationController
  before_action :set_project, only: [:edit, :update, :destroy]
  before_action :authenticate_user!

  layout "application"

  def index
    @projects = Project.all
  end

  def new
    @project = Project.new
  end

  def edit
  end

  def create
    @project = Project.new(project_params)

    if @project.save
      redirect_to projects_path, notice: 'Project was successfully created.' 
    else
      render :new 
    end
  end

  def update
    if @project.update(project_params)
      redirect_to projects_path, notice: 'Project was successfully updated.' 
    else
      render :edit 
    end
  end

  def destroy
    @project.destroy
    redirect_to projects_path, notice: 'Project was successfully destroyed.' 
  end

  def select_project
    if params["project_id"] && current_user.allow_project?(params["project_id"].to_i)
      current_user.set_last_project(params["project_id"].to_i)
      session[:project_id] = params["project_id"].to_i
      session[:project_name] = Project.find(session[:project_id]).name
    end
    redirect_to root_path
  end

  private
    def set_project
      @project = Project.find(params[:id])
    end

    def project_params
      params.require(:project).permit(:name)
    end

end
