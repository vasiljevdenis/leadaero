import { useTheme } from '@emotion/react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Typography, useMediaQuery } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';
import CollectionsIcon from '@mui/icons-material/Collections';
import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import ImageGallery from 'react-image-gallery';
import { useRef } from 'react';
import "react-image-gallery/styles/scss/image-gallery.scss";
import optionCategories from '../helpers/optionCategories';

const ServiceDescription = ({ open, setOpen, serviceInfo }) => {

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [data, setData] = useState({});
  const [images, setImages] = useState([]);
  const galleryRef = useRef(null);

  const handleClose = () => {
    setOpen(false);
  };

  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  useEffect(() => {
    if (serviceInfo.id) {
      axios.get(`/api/service?id=${serviceInfo.id}`)
        .then(function (res) {
          if (res.data.status) {
            const data = res.data.result;
            setData(data.result);
            const imgs = data.result.common.interior_photos.map(el => {
              return {
                original: el.url.replace('sandbox.', ''),
                thumbnail: el.thumb.replace('sandbox.', ''),
                originalAlt: el.alt?.ru || "",
                thumbnailAlt: el.alt?.ru || ""
              }
            });
            setImages(imgs);
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  }, [serviceInfo])

  useEffect(() => {
    if (galleryRef.current && fullscreen) {
      galleryRef.current.toggleFullScreen();
    }
  }, [fullscreen])

  return (
    <>
      {serviceInfo?.id && data?.common && (
        <Dialog
          fullScreen={fullScreen}
          maxWidth="lg"
          open={open}
          onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title" sx={{ backgroundColor: 'primary.main', color: 'white', position: 'relative' }}>
            <Typography variant='body2' component={"p"}>{serviceInfo.terminal.label}, {serviceInfo.type === "departure" ? "вылет" : serviceInfo.type === "arrival" ? "прилет" : ""}</Typography>
            <Typography variant='h6' component={"p"}>{data.common.name} для {serviceInfo.flightType === "domestic" ? "внутренних" : serviceInfo.flightType === "international" ? "международных" : ""} рейсов</Typography>
            <IconButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', top: 5, right: 5 }}>
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{
              width: '100%',
              height: '500px',
              background: data.common.interior_photos.length > 0 ? `url(${data.common.interior_photos[0]?.url?.replace('sandbox.', '')})` : 'url(/assets/images/plane-bg.webp)',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Box sx={{
                backgroundColor: 'rgba(0,0,0,.5)',
                width: '100%',
                maxWidth: '800px',
                color: 'white',
                p: 4
              }}>
                <Typography variant='h4' component={"p"} fontWeight={600}>{serviceInfo.priceGroup?.passengerCategories[serviceInfo.priceGroup?.passengerCategories.length - 1].price?.value?.toString().replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ') + ' ₽'}</Typography>
                <Typography variant='body1' component={"p"} gutterBottom>при заказе для одного пассажира</Typography>
                <Typography variant='body2' component={"p"} gutterBottom>Дети до {serviceInfo.priceGroup?.passengerCategories[0].ages.max} лет - бесплатно. Дети от {serviceInfo.priceGroup?.passengerCategories[1].ages.min} до {serviceInfo.priceGroup?.passengerCategories[1].ages.max} лет - {serviceInfo.priceGroup?.passengerCategories[1].price?.value?.toString().replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ') + ' ₽'}.</Typography>
                {parseFloat(serviceInfo.priceGroup?.passengerCategories[serviceInfo.priceGroup?.passengerCategories.length - 1].urgency_charge).toFixed() > 0 && (
                  <Typography variant='body2' component={"p"} gutterBottom>При оформлении за 25 часов до услуги — наценка за срочность: {parseFloat(serviceInfo.priceGroup?.passengerCategories[serviceInfo.priceGroup?.passengerCategories.length - 1].urgency_charge).toFixed().toString().replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ') + ' ₽'}</Typography>
                )}
                <Button variant="contained" sx={{ borderRadius: '30px', mt: 2, px: 4 }}>Заказать</Button>
              </Box>
              <Typography variant='body1' component="div" onClick={toggleFullscreen} sx={{
                cursor: 'pointer',
                display: data.common.interior_photos.length > 0 ? 'block' : 'none',
                backgroundColor: 'primary.main',
                color: 'white',
                position: 'absolute',
                bottom: 0,
                py: '10px',
                px: '20px',
                right: 20
              }}>
                <CollectionsIcon sx={{ verticalAlign: 'middle' }} /> <span style={{ verticalAlign: 'middle' }}>Фотогалерея</span>
              </Typography>
            </Box>
            <Grid container>
              <Grid item xs={12} md={3} p={2.5} order={fullScreen ? 2 : 1}>
                {data.option_categories.map(el => (
                  <React.Fragment key={"el-" + el.type}>
                    {console.log(el.type)}
                    {console.log(optionCategories[el.type])}
                    <Typography variant='body1' component={"p"}>{optionCategories[el.type]?.icon()}</Typography>
                    <Typography variant='caption' component={"p"} gutterBottom>{el.description}</Typography>
                    {el.options.map((item, i) => (
                      <Typography mb={i === el.options.length - 1 ? 3 : 0} key={"item-" + i} variant='caption' component={"p"} gutterBottom>{item.description ? item.description : item.name}</Typography>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
              <Grid item xs={12} md={9} p={2.5} order={!fullScreen ? 2 : 1}>
                <DialogContentText>
                  {data.common.detailed_description}
                </DialogContentText>
              </Grid>
            </Grid>
            {fullscreen && (
              <ImageGallery
                ref={galleryRef}
                items={images}
                showPlayButton={false}
                autoPlay={false}
                fullscreen
                onScreenChange={(f) => !f && toggleFullscreen()}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} autoFocus>
              Закрыть
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}

export default ServiceDescription