FROM debian:buster-slim
RUN apt-get update -y
RUN apt install -y wget cmake libjpeg-dev libpng-dev libnetcdf-dev hdf5-tools libhdf5-dev libhdf5-serial-dev

ARG VERSION=2.19.1

WORKDIR /tmp

ENV DOWNLOAD_URL=https://confluence.ecmwf.int/download/attachments/45757960
ENV ECCODES=eccodes-${VERSION}-Source
RUN cd /tmp && wget --output-document=${ECCODES}.tar.gz ${DOWNLOAD_URL}/${ECCODES}.tar.gz?api=v2
RUN tar -zxvf ${ECCODES}.tar.gz

RUN cd ${ECCODES} && mkdir build && cd build && cmake -DENABLE_FORTRAN=OFF -DENABLE_PNG=ON .. && make -j2 && make install

CMD grib_dump $ARGS
