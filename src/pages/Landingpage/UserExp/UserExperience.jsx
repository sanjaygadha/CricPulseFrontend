import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './UserExprence.css'; 

const UsersExp = () => {
  const testimonials = [
    {
      name: 'Mahendra Singh Dhoni',
      rating: 5,
      comment: 'Amazing cricket scoring app. Any time you can check insights of opponents and make strategy against the team as well as individuals.',
      image: 'https://cdn.britannica.com/25/222725-050-170F622A/Indian-cricketer-Mahendra-Singh-Dhoni-2011.jpg',
    },
    {
      name: 'Virat Kohli',
      rating: 5,
      comment: 'Great app for tracking live scores and player statistics. Highly recommended for cricket enthusiasts!',
      image: 'https://st3.cricketcountry.com/wp-content/uploads/2016/05/000_AW069.jpg',
    },
    {
      name: 'Kane Williamson',
      rating: 4,
      comment: 'Very user-friendly interface. Love the detailed match analysis and player performance insights.',
      image: 'https://wallpapercave.com/wp/wp8897999.jpg',
    },
    {
      name: 'Suresh Raina',
      rating: 5,
      comment: 'The best cricket app I have ever used. It has everything a cricket fan needs! Plus, the real-time updates keep me hooked during every match.',
      image: 'https://www.orissapost.com/wp-content/uploads/2020/08/917625-820013-suresh-raina.jpg',
    },
    {
      name: 'Ricky Ponting',
      rating: 4,
      comment: 'Excellent app for live scores and match updates. The player stats are very detailed and useful.',
      image: 'https://ilarge.lisimg.com/image/7384322/740full-ricky-ponting.jpg',
    },
  ];

  // Slider settings with responsive adjustments
  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 600,
  //   slidesToShow: 3, // Default: 3 cards on large screens
  //   slidesToScroll: 1,
  //   autoplay: true,
  //   autoplaySpeed: 3000,
  //   pauseOnHover: true,
  //   centerMode: false, // Disable centerMode to avoid partial card visibility
  //   responsive: [
  //     {
  //       breakpoint: 1024, // Tablets and small laptops
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 1,
  //       },
  //     },
  //     {
  //       breakpoint: 768, // Tablets and large phones
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //       },
  //     },
  //     {
  //       breakpoint: 480, // Small phones
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1,
  //       },
  //     },
  //   ],
  // };

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: false, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="testimonials-section">
      <h2>Cricket Legends Speak</h2>
      <Slider {...settings}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card-wrapper">
            <div className="testimonial-card">
              <div className="user-image">
                <img src={testimonial.image} alt={testimonial.name} />
              </div>
              <h3>{testimonial.name}</h3>
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <div className="comment">
                <p>{testimonial.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default UsersExp;