FROM httpd:2.4

LABEL maintainer "Jeff Vier <jeff@jeffvier.com>"

ENV REFRESHED_AT 2020-12-09

COPY dist /usr/local/apache2/htdocs/dist
COPY favicon.png /usr/local/apache2/htdocs/dist/
COPY index.html /usr/local/apache2/htdocs/
