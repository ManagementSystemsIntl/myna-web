module ApplicationHelper

  def active_class(ctrl)
    current_page?({:controller => ctrl}) ? "active" : ""
  end

end
