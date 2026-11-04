source "https://rubygems.org"

# The same Jekyll and plugin versions GitHub Pages builds the live site with.
# Local preview: bundle install, then bundle exec jekyll serve
gem "github-pages", group: :jekyll_plugins

# Ruby 3 stopped bundling the web server `jekyll serve` uses.
gem "webrick"

# Windows has no system timezone database for Jekyll to read.
platforms :windows do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
