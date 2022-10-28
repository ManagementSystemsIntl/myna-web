FROM ruby:2.6.3
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ stretch-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
 && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
 && apt-get update -qq && apt-cache search postgresql | grep postgresql-client \
 && apt-get install -y postgresql-client-11 \
 && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
 && apt install nodejs -y \
 && apt-get clean autoclean \
 && apt-get autoremove -y \
 && rm -rf \
    /var/lib/apt \
    /var/lib/dpkg \
    /var/lib/cache \
    /var/lib/log
RUN mkdir /myna-web
WORKDIR /myna-web
COPY Gemfile /myna-web/Gemfile
COPY Gemfile.lock /myna-web/Gemfile.lock
RUN bundle install
COPY . /myna-web

# Add a script to be executed every time the container starts.
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 3000

# Start the main process.
CMD ["bundle", "exec", "puma"]