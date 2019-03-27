class ChoiceListsController < ApiController
  before_action :set_choice_list, only: [:show, :update, :destroy]
  before_action :authenticate_user!

  def index
    @choice_lists = ChoiceList.where(:survey_group_id => params[:survey_group_id])
  end

  def show
  end

  def create
    @choice_list = ChoiceList.new(choice_list_params)
    list_options = params["list_options"].split(",").map{|fs| fs.split("_")}
    choice_option = QuestionOption.find_by(:name=>"choice")
    if @choice_list.save
      list_options.each_with_index do |lo,i|
        QuestionAttribute.create(:question_option => choice_option, :name => "choice", :value => lo[0], :coded_value => lo[1], :order => i, :choice_list => @choice_list)
      end
      render :show, status: :created, location: @choice_list
    else
      render json: @choice_list.errors, status: :unprocessable_entity
    end
  end

  def update
    list_options = params["list_options"].split(",").map{|fs| fs.split("_")}
    choice_option = QuestionOption.find_by(:name=>"choice")
    if @choice_list.update(choice_list_params)
      existing = []
      list_options.each_with_index do |lo,i|
        opt = @choice_list.question_attributes.find_by(:value => lo[0], :coded_value => lo[1])
        unless opt.nil?
          existing << opt.id
          opt.update(:order => i)
        else
          qa = QuestionAttribute.create(:question_option => choice_option, :name => "choice", :value => lo[0], :coded_value => lo[1], :order => i, :choice_list => @choice_list)
          existing << qa.id
        end
      end
      @choice_list.question_attributes.where.not(id: existing).destroy_all
      render :show, status: :ok, location: @choice_list
    else
      render json: @choice_list.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @choice_list.destroy
    head :no_content
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_choice_list
      @choice_list = ChoiceList.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def choice_list_params
      params.require(:choice_list).permit(:id, :name, :survey_group_id, :language_id)
    end
end
